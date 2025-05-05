"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Leaf, Bell, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useAlert } from "@/context/alert-context"
import { useEffect } from "react"

export function DashboardHeader() {
  const { userProfile, logout } = useAuth()
  const { unreadAlertsCount, fetchAlerts } = useAlert()

  useEffect(() => {
    // Charger les alertes au montage du composant
    fetchAlerts()

    // Mettre à jour les alertes toutes les 60 secondes
    const intervalId = setInterval(() => {
      fetchAlerts()
    }, 60000)

    // Nettoyer l'intervalle lors du démontage
    return () => clearInterval(intervalId)
  }, [fetchAlerts])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/"
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold text-green-800">AgriLink</span>
        </Link>
        <div className="flex items-center gap-4">
          {userProfile ? (
            <p className="text-sm text-gray-500 hidden md:block">
              Bonjour, {userProfile.firstName} {userProfile.lastName}
            </p>
          ) : (
            <p className="text-sm text-gray-500 hidden md:block">Mode démo - Aucune connexion requise</p>
          )}
          <Link href="/dashboard/alerts">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadAlertsCount}
                </span>
              )}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {userProfile ? (
                <>
                  <DropdownMenuLabel>
                    {userProfile.firstName} {userProfile.lastName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Utilisateur démo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Se connecter</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
