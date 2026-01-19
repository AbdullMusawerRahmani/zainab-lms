"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, UserCog, BookOpen } from "lucide-react"

import { ChartBarMultiple } from "@/components/ui/chart-bar-multiple"
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
import { Calendar02 } from "@/components/ui/calendar-modern"
import { cn } from "@/lib/utils"

// 🧾 Recent Activities Component
function RecentActivities() {
  const activities = [
    { id: 1, title: "New student registered", description: "Aisha Noor joined Grade 8", time: "2 hours ago" },
    { id: 2, title: "Teacher uploaded new material", description: "Math - Algebra Basics", time: "4 hours ago" },
    { id: 3, title: "Finance report updated", description: "Quarterly report finalized", time: "Yesterday" },
    { id: 4, title: "Discipline policy revised", description: "New code of conduct uploaded", time: "2 days ago" },
  ]

  

  return (
    <Card className="bg-background  shadow-md rounded-2xl hover:shadow-lg transition p-4">
      <CardHeader>
        <CardTitle className="text-foreground" >Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ul >
          {activities.map((item) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-2 border border-border rounded-lg my-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <div>
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 sm:mt-0">{item.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// 📊 Dashboard
export default function Home() {
  const stats = [
    {
      title: "Total Students",
      value: 1200,
      icon: <GraduationCap className="h-10 w-10 text-blue-500 dark:text-blue-950" />,
      color: "bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900  ",
    },
    {
      title: "Total Teachers",
      value: 85,
      icon: <Users className="h-10 w-10 text-emerald-500 dark:text-emerald-950" />,
      color: "bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900",
    },
    {
      title: "Total Employees",
      value: 45,
      icon: <UserCog className="h-10 w-10 text-amber-500 dark:text-amber-950" />,
      color: "bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900",
    },
    {
      title: "Total Courses",
      value: 30,
      icon: <BookOpen className="h-10 w-10 text-violet-500 dark:text-violet-950" />,
      color: "bg-violet-50 dark:bg-violet-950 hover:bg-violet-100 dark:hover:bg-violet-900",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b bg-background/60  backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Dashboard Content */}
        <div className="flex flex-1 flex-col gap-6 p-6 bg-background">

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, i) => (
              <Card
                key={i}
                className={cn("border-none shadow-md rounded-2xl transition hover:shadow-lg", item.color)}
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-3xl font-bold text-mut-foreground mt-1">{item.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-white shadow-inner">{item.icon}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Attendance Chart */}
            <Card className="col-span-2 shadow-md rounded-2xl hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartBarMultiple />
              </CardContent>
            </Card>

            {/* Age Distribution Pie Chart */}
            <Card className="shadow-md rounded-2xl hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Students by Age Group</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartPieInteractive />
              </CardContent>
            </Card>
          </div>

          {/* Calendar & Recent Activities */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calendar */}
            <Card className="shadow-md rounded-2xl hover:shadow-lg transition w-2xl ">
              <CardHeader>
                <CardTitle>School Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar02 />
              </CardContent>
            </Card>

            {/* Activities */}
            <RecentActivities />
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
