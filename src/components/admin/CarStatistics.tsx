
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CarStatistics = () => {
  const data = [
    { name: "Седаны", value: 28, color: "#3B82F6" },
    { name: "Кроссоверы", value: 35, color: "#10B981" },
    { name: "Внедорожники", value: 15, color: "#F59E0B" },
    { name: "Хэтчбеки", value: 12, color: "#8B5CF6" },
    { name: "Другие", value: 10, color: "#EC4899" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика автомобилей</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} авто`, 'Количество']} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarStatistics;
