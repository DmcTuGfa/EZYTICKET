"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Ticket, Settings, ChevronLeft, ChevronRight, FileBarChart, Wrench } from "lucide-react"
import { useState } from "react"

type View = "dashboard" | "tickets" | "maintenances" | "reports"

interface AppSidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
    { id: "tickets" as View, label: "Tickets", icon: Ticket },
    { id: "maintenances" as View, label: "Mantenimientos", icon: Wrench },
    { id: "reports" as View, label: "Reportes", icon: FileBarChart },
  ]

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Ticket className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">TicketHub</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              currentView === item.id && "bg-sidebar-accent text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Configuracion</span>}
        </Button>
      </div>
    </aside>
  )
}
