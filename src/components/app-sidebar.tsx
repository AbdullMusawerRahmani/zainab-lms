"use client";

import * as React from "react";
import {
  AudioWaveform,
  CircleDollarSign,
  Command,
  GalleryVerticalEnd,
  GraduationCap,
  Library,
  NotepadText,
  ShieldUser,
  SquareUser,
  UserCog,
  Users,
  UsersRoundIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Zainab Ghazali",
    email: "zainabghazali.edu.com",
  },
  teams: [
    {
      name: "Zainab Ghazali",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Students Management",
      url: "#",
      icon: SquareUser,
      isActive: true,
      items: [
        {
          title: "Students",
          url: "/students",
        },
        {
         title: "Student Attendance",
          url: "/students/student-attendence",
        },
        {
          title: "Student Leave Requests ",
          url: "#",
        },
        {
          title: "Student Discipline ",
          url: "#",
        },
        {
          title: "Student Reports ",
          url: "#",
        },
      ],
    },
    {
      title: "Classes & Academic",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Classes ",
          url: "/classes",
        },
        {
          title: "Subjects ",
          url: "#",
        },
        {
          title: "Teacher Subjects ",
          url: "#",
        },
        {
          title: "Schedules  ",
          url: "#",
        },
        {
          title: "Educational Plans ",
          url: "#",
        },
      ],
    },
    {
      title: "Humman Resource",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Employees ",
          url: "/employee",
        },
        {
          title: "Employee Attendance ",
          url: "#",
        },
        {
          title: "Employee Transfers ",
          url: "#",
        },
        {
          title: "Salary Structures ",
          url: "#",
        },
      ],
    },
    {
      title: "Finance & Depot",
      url: "#",
      icon: CircleDollarSign,
      items: [
        {
          title: "Fees ",
          url: "./fee",
        },
        {
          title: "Payments ",
          url: "#",
        },
        {
          title: "Inventory ",
          url: "#",
        },
        {
          title: "FinancialReports ",
          url: "#",
        },
      ],
    },
    {
      title: "Discipline Policies ",
      url: "#",
      icon: ShieldUser,
      items: [
        {
          title: "Discipline Policies ",
          url: "#",
        },
      ],
    },

    {
      title: "Examination & Questions",
      url: "#",
      icon: NotepadText,
      items: [
        {
          title: "Exams",
          url: "#",
        },
        {
          title: "Exam Schedules",
          url: "#",
        },
        {
          title: "Exam Results",
          url: "#",
        },
        {
          title: "QuestionBank",
          url: "#",
        },
      ],
    },

    {
      title: "Library",
      url: "#",
      icon: Library,
      items: [
        {
          title: "Library Books ",
          url: "#",
        },
        {
          title: "Borrowed Books ",
          url: "#",
        },
      ],
    },
    {
      title: "Parents",
      url: "#",
      icon: UsersRoundIcon,
      items: [
        {
          title: "Parents",
          url: "#",
        },
        {
          title: "Parent Notifications",
          url: "#",
        },
      ],
    },
     {
      title: "User Management",
      url: "#",
      icon: UserCog,
      items: [
          {
          title: "User & Roles",
          icon: UserCog,
          url: "/user&role",
        },
    
      ],
    },
      
      
    
  ],

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
