"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const data = [
  { name: "Students", value: 1200 },
  { name: "Teachers", value: 85 },
  { name: "Employees", value: 45 },
  { name: "Courses", value: 30 },
]

const COLORS = ["#2563EB", "#16A34A", "#FACC15", "#9333EA"]

export function ChartPieInteractive() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
