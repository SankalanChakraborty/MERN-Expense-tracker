import { PieChart, Pie, Cell, Label } from "recharts";

const data = [
  { name: "Groceries", value: 28 },
  { name: "Transport", value: 16 },
  { name: "Dining", value: 22 },
  { name: "Bills", value: 20 },
  { name: "Shopping", value: 14 },
];

const COLORS = ["#F59E0B", "#3B82F6", "#EF4444", "#10B981", "#8B5CF6"];

const Chart = () => {
  return (
    <PieChart width={200} height={200}>
      <Pie data={data} innerRadius={60} outerRadius={90} dataKey="value">
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index]} />
        ))}
        <Label
          value={"Expense breakup"}
          position="center"
          fill="#fff"
          fontSize={12}
          fontWeight={600}
        />
      </Pie>
    </PieChart>
  );
};

export default Chart;
