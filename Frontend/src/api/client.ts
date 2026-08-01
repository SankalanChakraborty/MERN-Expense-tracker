import { API_BASE_URI } from "../../constants";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Endpoints whose 401 a refresh cannot fix: bad credentials, or the refresh
 * call itself (which would recurse). Everything else gets one refresh+retry.
 */
const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

const isRefreshable = (path: string) =>
  !NO_REFRESH_PATHS.some((prefix) => path.startsWith(prefix));

const refreshAccessToken = async (): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URI}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
};

const rawRequest = (path: string, options: ApiRequestOptions = {}) => {
  const { body, headers, ...rest } = options;
  return fetch(`${API_BASE_URI}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    ...rest,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
};

export async function apiRequest<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<T> {
  let response = await rawRequest(path, options);

  // Any 401 on a protected route means the access token is gone or stale.
  // Don't gate this on a specific error code: the access cookie expires with
  // the token it holds, so the common case reaches the server as a *missing*
  // cookie ("Access token is missing"), never as an expired JWT. The refresh
  // cookie lives 7 days and may well still be valid, so always try once.
  if (response.status === 401 && isRefreshable(path)) {
    // Shared promise so a burst of parallel 401s triggers one refresh, not N.
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;

    if (refreshed) {
      // Safe to replay: rawRequest re-serialises `body` each call, so nothing
      // is a consumed stream.
      response = await rawRequest(path, options);
    } else {
      sessionExpiredHandler?.();
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? "Something went wrong. Please try again.",
      response.status,
      data,
    );
  }

  return data as T;
}
