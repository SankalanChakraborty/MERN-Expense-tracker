import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CurrencyCode, Expense } from "../types";
import { useCurrency } from "../hooks/useCurrency";
import { formatCurrency } from "../utils/currency";
import "./Charts.css";

const ACCENT = "#f59e0b";
const GRID_LINE = "rgba(255, 255, 255, 0.06)";
const TICK_STYLE = { fill: "#64748b", fontSize: 12 };

interface MonthDatum {
  key: string;
  label: string;
  amount: number;
}

const buildLastSixMonths = (): MonthDatum[] => {
  const months: MonthDatum[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      amount: 0,
    });
  }

  return months;
};

interface TooltipPayload {
  payload: MonthDatum;
}

const TrendTooltip = ({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  currency: CurrencyCode;
}) => {
  if (!active || !payload?.length) return null;
  const { label, amount } = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-value">
        {formatCurrency(amount, currency)}
      </span>
      <span className="chart-tooltip-label">{label}</span>
    </div>
  );
};

interface SpendingTrendChartProps {
  expenses: Expense[];
}

const SpendingTrendChart = ({ expenses }: SpendingTrendChartProps) => {
  const currency = useCurrency();
  const data = useMemo(() => {
    const months = buildLastSixMonths();
    const byKey = new Map(months.map((month) => [month.key, month]));

    expenses.forEach((expense) => {
      const d = new Date(expense.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.amount += expense.amount;
    });

    return months;
  }, [expenses]);

  const hasData = data.some((month) => month.amount > 0);

  if (!hasData) {
    return (
      <div className="chart-card chart-empty">
        Add a few expenses to see your 6-month spending trend.
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h4>Spending trend (last 6 months)</h4>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke={GRID_LINE} />
          <XAxis
            dataKey="label"
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            content={<TrendTooltip currency={currency} />}
            cursor={{ stroke: "rgba(255, 255, 255, 0.12)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={ACCENT}
            strokeWidth={2}
            fill={ACCENT}
            fillOpacity={0.1}
            dot={{ r: 4, fill: ACCENT, stroke: "#1a2744", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: ACCENT, stroke: "#1a2744", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingTrendChart;
