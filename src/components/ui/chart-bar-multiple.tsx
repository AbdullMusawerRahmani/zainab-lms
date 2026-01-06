"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function ChartBarMultiple() {
  const data = [
    { month: "Jan", students: 90, teachers: 30 },
    { month: "Feb", students: 120, teachers: 35 },
    { month: "Mar", students: 140, teachers: 40 },
    { month: "Apr", students: 160, teachers: 45 },
    { month: "May", students: 200, teachers: 50 },
    { month: "Jun", students: 180, teachers: 55 },
    { month: "Jul", students: 220, teachers: 60 },
  ]

  return (
    <Card className="border shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Monthly Enrollment & Teacher Growth
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="teachers" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
