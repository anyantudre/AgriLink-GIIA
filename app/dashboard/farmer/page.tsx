"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  Droplets,
  ThermometerSun,
  Waves,
  TrendingUp,
  Minus,
  AlertTriangle,
  ArrowLeft,
  TrendingDown,
  Download,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useAlert } from "@/context/alert-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format, subDays, subWeeks, subMonths, isAfter } from "date-fns"
import { LineChart } from "@/components/charts"
import { useToast } from "@/components/ui/use-toast"

// Type pour les données de capteurs
interface SensorData {
  id?: string
  sensorId: string
  type: "humidity" | "temperature" | "water"
  value: number
  unit: string
  location: string
  timestamp: Date
  userId: string
}

export default function FarmerDashboard() {
  const [sensorData, setSensorData] = useState({
    humidity: { value: 0, trend: 0 },
    temperature: { value: 0, trend: 0 },
    water: { value: 0, trend: 0 },
  })
  const [chartData, setChartData] = useState<SensorData[]>([])
  const { user } = useAuth()
  const { alerts, fetchAlerts, markAlertAsRead, formatAlertTime } = useAlert()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  // États pour les filtres
  const [sensorType, setSensorType] = useState<string>("all")
  const [period, setPeriod] = useState<string>("day")
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [location, setLocation] = useState<string>("all")
  const [locations, setLocations] = useState<string[]>([])

  // Fonction pour récupérer les données en fonction des filtres
  const fetchFilteredData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Déterminer les dates de début et de fin en fonction de la période
      let startDateTime = new Date()
      const endDateTime = new Date()

      if (period === "day") {
        startDateTime = subDays(endDateTime, 1)
      } else if (period === "week") {
        startDateTime = subWeeks(endDateTime, 1)
      } else if (period === "month") {
        startDateTime = subMonths(endDateTime, 1)
      } else if (period === "custom") {
        startDateTime = new Date(startDate)
        endDateTime.setTime(new Date(endDate).getTime() + 86400000) // Ajouter un jour pour inclure la date de fin
      }

      // Récupérer les données des capteurs
      let sensorQuery = query(collection(db, "sensorData"), where("userId", "==", user.uid || "demo-user-id"))

      if (sensorType !== "all") {
        sensorQuery = query(sensorQuery, where("type", "==", sensorType))
      }

      const sensorSnapshot = await getDocs(sensorQuery)
      const sensorDataList: SensorData[] = []
      const locationSet = new Set<string>()

      sensorSnapshot.forEach((doc) => {
        const data = doc.data() as SensorData
        data.id = doc.id

        // Convertir le timestamp Firestore en Date
        if (data.timestamp) {
          if (typeof data.timestamp === "object" && "seconds" in data.timestamp) {
            data.timestamp = new Date((data.timestamp as any).seconds * 1000)
          } else if (!(data.timestamp instanceof Date)) {
            data.timestamp = new Date(data.timestamp)
          }
        } else {
          data.timestamp = new Date()
        }

        // Filtrer par date
        if (isAfter(data.timestamp, startDateTime) && data.timestamp <= endDateTime) {
          // Filtrer par emplacement si nécessaire
          if (location === "all" || data.location === location) {
            sensorDataList.push(data)
          }
        }

        // Collecter les emplacements uniques
        locationSet.add(data.location)
      })

      // Trier par date (plus récent en premier)
      sensorDataList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      // Mettre à jour la liste des emplacements
      setLocations(Array.from(locationSet))

      // Calculer les dernières valeurs et tendances pour chaque type de capteur
      const latestData: Record<string, number> = {}
      const trendData: Record<string, number> = {}
      const sensorTypes = ["humidity", "temperature", "water"]

      for (const type of sensorTypes) {
        const typeData = sensorDataList.filter((data) => data.type === type)

        if (typeData.length > 0) {
          // Dernière valeur
          latestData[type] = typeData[0].value

          // Calculer la tendance (différence entre la dernière et l'avant-dernière valeur)
          if (typeData.length > 1) {
            trendData[type] = Math.round((typeData[0].value - typeData[1].value) * 10) / 10
          } else {
            trendData[type] = 0
          }
        }
      }

      // Mettre à jour l'état des données des capteurs
      setSensorData({
        humidity: {
          value: latestData.humidity || 68,
          trend: trendData.humidity || 0,
        },
        temperature: {
          value: latestData.temperature || 24,
          trend: trendData.temperature || 0,
        },
        water: {
          value: latestData.water || 85,
          trend: trendData.water || 0,
        },
      })

      // Préparer les données pour le graphique
      setChartData(sensorDataList)

      // Récupérer les alertes
      await fetchAlerts()
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchFilteredData()
  }, [user])

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    fetchFilteredData()
  }

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    try {
      // En-têtes CSV
      let csvContent = "Type,Valeur,Unité,Emplacement,Date\n"

      // Ajouter les données
      chartData.forEach((data) => {
        const row = [
          data.type,
          data.value,
          data.unit,
          data.location,
          format(data.timestamp, "dd/MM/yyyy HH:mm:ss"),
        ].join(",")
        csvContent += row + "\n"
      })

      // Créer un blob et un lien de téléchargement
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `agrilink_data_${format(new Date(), "yyyyMMdd")}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportation réussie",
        description: "Les données ont été exportées au format CSV.",
      })
    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour marquer une alerte comme lue
  const handleMarkAlertAsRead = async (alertId: string) => {
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

  // Fonction pour formater la date de dernière mise à jour
  const formatLastUpdate = () => {
    return "il y a 5 minutes"
  }

  // Filtrer les alertes non lues pour l'affichage
  const displayAlerts = alerts.filter((alert) => !alert.isRead).slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au site
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-green-800">Tableau de bord Agriculteur</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={exportToCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchFilteredData}>
                Actualiser
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">Chargement des données...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Humidité du sol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-8 w-8 text-blue-500" />
                        <div className="text-3xl font-bold">{sensorData.humidity.value}%</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${
                          sensorData.humidity.trend > 0
                            ? "text-green-600 border-green-200 bg-green-50"
                            : sensorData.humidity.trend < 0
                              ? "text-red-600 border-red-200 bg-red-50"
                              : "text-gray-600 border-gray-200 bg-gray-50"
                        }`}
                      >
                        {sensorData.humidity.trend > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : sensorData.humidity.trend < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {sensorData.humidity.trend > 0 ? "+" : ""}
                          {sensorData.humidity.trend}%
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Dernière mise à jour: {formatLastUpdate()}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Température</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-8 w-8 text-orange-500" />
                        <div className="text-3xl font-bold">{sensorData.temperature.value}°C</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${
                          sensorData.temperature.trend > 0
                            ? "text-red-600 border-red-200 bg-red-50"
                            : sensorData.temperature.trend < 0
                              ? "text-green-600 border-green-200 bg-green-50"
                              : "text-gray-600 border-gray-200 bg-gray-50"
                        }`}
                      >
                        {sensorData.temperature.trend > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : sensorData.temperature.trend < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {sensorData.temperature.trend > 0 ? "+" : ""}
                          {sensorData.temperature.trend}°C
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Dernière mise à jour: {formatLastUpdate()}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Niveau d&apos;eau</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="h-8 w-8 text-blue-600" />
                        <div className="text-3xl font-bold">{sensorData.water.value}%</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${
                          sensorData.water.trend > 0
                            ? "text-green-600 border-green-200 bg-green-50"
                            : sensorData.water.trend < 0
                              ? "text-red-600 border-red-200 bg-red-50"
                              : "text-gray-600 border-gray-200 bg-gray-50"
                        }`}
                      >
                        {sensorData.water.trend > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : sensorData.water.trend < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {sensorData.water.trend > 0 ? "+" : ""}
                          {sensorData.water.trend}%
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Dernière mise à jour: {formatLastUpdate()}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-green-800">Filtres</CardTitle>
                        <CardDescription>Affinez les données affichées</CardDescription>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={applyFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Appliquer les filtres
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sensor">Capteur</Label>
                        <Select value={sensorType} onValueChange={setSensorType}>
                          <SelectTrigger id="sensor">
                            <SelectValue placeholder="Sélectionner un capteur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les capteurs</SelectItem>
                            <SelectItem value="humidity">Capteurs d&apos;humidité</SelectItem>
                            <SelectItem value="temperature">Capteurs de température</SelectItem>
                            <SelectItem value="water">Capteurs de niveau d&apos;eau</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Emplacement</Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger id="location">
                            <SelectValue placeholder="Sélectionner un emplacement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les emplacements</SelectItem>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period">Période</Label>
                      <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger id="period">
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Aujourd&apos;hui</SelectItem>
                          <SelectItem value="week">Cette semaine</SelectItem>
                          <SelectItem value="month">Ce mois</SelectItem>
                          <SelectItem value="custom">Personnalisée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {period === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Date de début</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">Date de fin</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-green-800">Alertes</CardTitle>
                        <CardDescription>Notifications récentes</CardDescription>
                      </div>
                      <Badge className="bg-red-500">{displayAlerts.length} nouvelles</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {displayAlerts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Aucune alerte pour le moment</div>
                      ) : (
                        displayAlerts.map((alert, index) => {
                          const alertType = alert.type || "humidity"
                          const severity = alert.severity || "medium"

                          let color = "blue"
                          if (alertType === "temperature") color = "red"
                          else if (alertType === "humidity") color = "amber"
                          else if (alertType === "water") color = "blue"

                          if (severity === "high") color = "red"
                          else if (severity === "medium") color = "amber"
                          else if (severity === "low") color = "blue"

                          return (
                            <div
                              key={alert.id || index}
                              className={`flex items-start gap-4 p-3 rounded-lg bg-${color}-50 border border-${color}-100`}
                            >
                              <AlertTriangle className={`h-5 w-5 text-${color}-500 mt-0.5`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-medium text-${color}-800`}>
                                    {alert.message || "Alerte détectée"}
                                  </h4>
                                  <span className="text-xs text-gray-500">{formatAlertTime(alert.timestamp)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{alert.location || "Zone inconnue"}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`mt-2 h-7 text-xs border-${color}-200 text-${color}-600 hover:bg-${color}-50`}
                                  onClick={() => alert.id && handleMarkAlertAsRead(alert.id)}
                                >
                                  Marquer comme lue
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      )}
                      {displayAlerts.length > 0 && (
                        <div className="text-center">
                          <Link href="/dashboard/alerts">
                            <Button variant="link" className="text-green-600">
                              Voir toutes les alertes
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-green-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-green-800">Évolution des données</CardTitle>
                  <CardDescription>
                    {sensorType === "all"
                      ? "Toutes les données des capteurs"
                      : `Données des capteurs de ${sensorType === "humidity" ? "humidité" : sensorType === "temperature" ? "température" : "niveau d'eau"}`}
                    {location !== "all" && ` - ${location}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <LineChart data={chartData} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
