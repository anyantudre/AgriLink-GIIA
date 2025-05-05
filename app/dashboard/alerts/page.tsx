"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useAlert } from "@/context/alert-context"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AlertsPage() {
  const { alerts, loadingAlerts, fetchAlerts, markAlertAsRead, formatAlertTime } = useAlert()
  const { userProfile, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [filteredAlerts, setFilteredAlerts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isCreatingTestAlerts, setIsCreatingTestAlerts] = useState(false)

  useEffect(() => {
    if (!loading && !userProfile) {
      router.push("/login")
      return
    }

    console.log("Appel de fetchAlerts depuis useEffect")
    fetchAlerts()
  }, [fetchAlerts, userProfile, loading, router])

  useEffect(() => {
    console.log("Mise à jour des alertes filtrées", { activeTab, alertsCount: alerts.length })
    if (activeTab === "all") {
      setFilteredAlerts(alerts)
    } else if (activeTab === "unread") {
      setFilteredAlerts(alerts.filter((alert) => !alert.isRead))
    } else if (activeTab === "high") {
      setFilteredAlerts(alerts.filter((alert) => alert.severity === "high"))
    }
  }, [alerts, activeTab])

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId)
      toast({
        title: "Succès",
        description: "L'alerte a été marquée comme lue",
      })
    } catch (error) {
      console.error("Erreur lors du marquage de l'alerte comme lue:", error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'alerte comme lue",
        variant: "destructive",
      })
    }
  }

  // Fonction pour créer des alertes de test
  const createTestAlerts = async () => {
    if (!userProfile) return

    try {
      setIsCreatingTestAlerts(true)
      const alertsRef = collection(db, "alerts")

      // Créer quelques alertes de test
      const testAlerts = [
        {
          type: "temperature",
          message: "Température élevée détectée",
          severity: "high",
          location: "Zone Nord",
          timestamp: new Date(),
          isRead: false,
          userId: userProfile.uid,
        },
        {
          type: "humidity",
          message: "Niveau d'humidité bas",
          severity: "medium",
          location: "Zone Est",
          timestamp: new Date(Date.now() - 3600000), // 1 heure avant
          isRead: false,
          userId: userProfile.uid,
        },
        {
          type: "water",
          message: "Niveau d'eau critique",
          severity: "high",
          location: "Zone Sud",
          timestamp: new Date(Date.now() - 7200000), // 2 heures avant
          isRead: false,
          userId: userProfile.uid,
        },
      ]

      for (const alert of testAlerts) {
        await addDoc(alertsRef, {
          ...alert,
          timestamp: Timestamp.fromDate(alert.timestamp),
        })
      }

      toast({
        title: "Succès",
        description: "Des alertes de test ont été créées",
      })

      // Rafraîchir les alertes
      await fetchAlerts()
    } catch (error) {
      console.error("Erreur lors de la création des alertes de test:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer des alertes de test",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTestAlerts(false)
    }
  }

  // Fonction pour obtenir les classes CSS en fonction de la sévérité et du type
  const getAlertColor = (severity: string, type: string) => {
    // Priorité à la sévérité
    if (severity === "high") {
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        text: "text-red-800",
        icon: "text-red-500",
      }
    }
    if (severity === "medium") {
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-800",
        icon: "text-amber-500",
      }
    }
    if (severity === "low") {
      return {
        bg: "bg-blue-50",
        border: "border-blue-100",
        text: "text-blue-800",
        icon: "text-blue-500",
      }
    }

    // Fallback sur le type
    if (type === "temperature") {
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        text: "text-red-800",
        icon: "text-red-500",
      }
    }
    if (type === "humidity") {
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-800",
        icon: "text-amber-500",
      }
    }
    if (type === "water") {
      return {
        bg: "bg-blue-50",
        border: "border-blue-100",
        text: "text-blue-800",
        icon: "text-blue-500",
      }
    }

    return {
      bg: "bg-gray-50",
      border: "border-gray-100",
      text: "text-gray-800",
      icon: "text-gray-500",
    }
  }

  console.log("État de chargement:", { loading, loadingAlerts })
  console.log("Nombre d'alertes:", alerts.length)
  console.log("Nombre d'alertes filtrées:", filteredAlerts.length)

  // Si nous sommes en train de charger, afficher un message de chargement
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement de l'utilisateur...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Alertes</h1>
            <div className="flex gap-2">
              {alerts.length === 0 && (
                <Button
                  variant="outline"
                  onClick={createTestAlerts}
                  disabled={isCreatingTestAlerts}
                  className="flex items-center gap-1"
                >
                  {isCreatingTestAlerts && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Créer des alertes de test
                </Button>
              )}
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => fetchAlerts()}
                disabled={loadingAlerts}
              >
                {loadingAlerts ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Actualiser"
                )}
              </Button>
            </div>
          </div>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Toutes les alertes</CardTitle>
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="unread">Non lues</TabsTrigger>
                  <TabsTrigger value="high">Priorité haute</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAlerts ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-green-600 mr-2" />
                  <span>Chargement des alertes...</span>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucune alerte pour le moment</div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => {
                    const alertType = alert.type || "humidity"
                    const severity = alert.severity || "medium"
                    const colors = getAlertColor(severity, alertType)

                    return (
                      <div
                        key={alert.id || Math.random().toString()}
                        className={`flex items-start gap-4 p-3 rounded-lg ${colors.bg} border ${colors.border} ${alert.isRead ? "opacity-70" : ""}`}
                      >
                        <AlertTriangle className={`h-5 w-5 ${colors.icon} mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${colors.text}`}>{alert.message || "Alerte détectée"}</h4>
                            <span className="text-xs text-gray-500">{formatAlertTime(alert.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Localisation: {alert.location || "Zone inconnue"}
                          </p>
                          {!alert.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              onClick={() => alert.id && handleMarkAsRead(alert.id)}
                            >
                              Marquer comme lue
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
