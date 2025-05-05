"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, Home, BarChart3, User, Settings, Bell, ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-green-50/50 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-lg font-bold text-green-800">AgriLink</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link
              href="/dashboard/farmer"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-green-900 hover:bg-green-100 hover:text-green-900 ${
                pathname === "/dashboard/farmer" ? "bg-green-100" : ""
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Tableau de bord</span>
            </Link>
            <Link
              href="/dashboard/researcher"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-green-900 hover:bg-green-100 hover:text-green-900 ${
                pathname === "/dashboard/researcher" ? "bg-green-100" : ""
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analyse des données</span>
            </Link>
            <Link
              href="/dashboard/alerts"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-green-900 hover:bg-green-100 hover:text-green-900 ${
                pathname === "/dashboard/alerts" ? "bg-green-100" : ""
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Alertes</span>
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                3
              </span>
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-green-900 hover:bg-green-100 hover:text-green-900 ${
                pathname === "/profile" ? "bg-green-100" : ""
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profil</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-green-900 hover:bg-green-100 hover:text-green-900 ${
                pathname === "/settings" ? "bg-green-100" : ""
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Link href="/">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
