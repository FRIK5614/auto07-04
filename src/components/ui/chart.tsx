
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type BarChartProps = {
  data: {
    name: string;
    data: Array<{
      x: string;
      y: number;
    }>;
  }[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
};

export const BarChart = ({
  data,
  categories,
  index,
  colors = ["blue", "green", "red", "yellow", "purple", "orange"],
  valueFormatter = (value) => `${value}`,
  yAxisWidth = 40,
}: BarChartProps) => {
  // Transform the data to the format expected by recharts
  const transformedData = data[0]?.data.map((item) => ({
    [index]: item.x,
    [data[0].name]: item.y,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={transformedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        <Bar dataKey={data[0].name} fill={colors[0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
