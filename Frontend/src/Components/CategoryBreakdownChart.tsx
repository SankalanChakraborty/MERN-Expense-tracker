import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CurrencyCode, Expense } from "../types";
import { useCurrency } from "../hooks/useCurrency";
import { formatCurrency, formatCompact } from "../utils/currency";
import "./Charts.css";

const ACCENT = "#f59e0b";
const GRID_LINE = "rgba(255, 255, 255, 0.06)";
const TICK_STYLE = { fill: "#64748b", fontSize: 12 };

interface CategoryDatum {
  category: string;
  amount: number;
}

interface TooltipPayload {
  payload: CategoryDatum;
}

const CategoryTooltip = ({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  currency: CurrencyCode;
}) => {
  if (!active || !payload?.length) return null;
  const { category, amount } = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-value">
        {formatCurrency(amount, currency)}
      </span>
      <span className="chart-tooltip-label">{category}</span>
    </div>
  );
};

interface CategoryBreakdownChartProps {
  expenses: Expense[];
}

const CategoryBreakdownChart = ({ expenses }: CategoryBreakdownChartProps) => {
  const currency = useCurrency();
  const data = useMemo<CategoryDatum[]>(() => {
    const totals = new Map<string, number>();
    expenses.forEach((expense) => {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    });
    return Array.from(totals, ([category, amount]) => ({ category, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="chart-card chart-empty">
        No expenses yet this month — add one to see your breakdown.
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h4>Spending by category (this month)</h4>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 44, left: 8, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} stroke={GRID_LINE} />
          <XAxis
            type="number"
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => formatCompact(value, currency)}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={90}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CategoryTooltip currency={currency} />}
            cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
          />
          <Bar dataKey="amount" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={24}>
            <LabelList
              dataKey="amount"
              position="right"
              formatter={(value: unknown) =>
                formatCompact(Number(value ?? 0), currency)
              }
              fill="#ffffff"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdownChart;
