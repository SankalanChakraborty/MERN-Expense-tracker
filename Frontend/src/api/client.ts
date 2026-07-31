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

  if (response.status === 401) {
    const cloned = await response
      .clone()
      .json()
      .catch(() => null);

    if (cloned?.code === "TOKEN_EXPIRED") {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;

      if (refreshed) {
        response = await rawRequest(path, options);
      } else {
        sessionExpiredHandler?.();
      }
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
