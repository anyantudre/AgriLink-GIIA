"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { BarChart, ScatterPlotChart, LineChart } from "@/components/charts"
import { Download, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format, subDays, subWeeks, subMonths, isAfter } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

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

export default function ResearcherDashboard() {
  const [loading, setLoading] = useState(true)
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  // États pour les filtres
  const [sensorType, setSensorType] = useState<string>("all")
  const [location, setLocation] = useState<string>("all")
  const [period, setPeriod] = useState<string>("month")
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

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

      // Mettre à jour les données des capteurs
      setSensorData(sensorDataList)
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

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    try {
      // En-têtes CSV
      let csvContent = "Type,Valeur,Unité,Emplacement,Date\n"

      // Ajouter les données
      sensorData.forEach((data) => {
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
              <h1 className="text-2xl font-bold tracking-tight text-green-800">Analyse des données</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={exportToCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger CSV
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchFilteredData}>
                Actualiser
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">Chargement des données...</div>
          ) : (
            <Tabs defaultValue="graphs" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="graphs">Graphiques</TabsTrigger>
                <TabsTrigger value="map">Carte</TabsTrigger>
                <TabsTrigger value="predictions">Prédictions</TabsTrigger>
              </TabsList>

              <TabsContent value="graphs" className="space-y-4">
                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-green-800">Filtres avancés</CardTitle>
                        <CardDescription>Affinez les données pour votre analyse</CardDescription>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={fetchFilteredData}>
                        <Filter className="mr-2 h-4 w-4" />
                        Appliquer les filtres
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sensorType">Type de capteur</Label>
                        <Select value={sensorType} onValueChange={setSensorType}>
                          <SelectTrigger id="sensorType">
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            <SelectItem value="humidity">Humidité</SelectItem>
                            <SelectItem value="temperature">Température</SelectItem>
                            <SelectItem value="water">Niveau d&apos;eau</SelectItem>
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
                    </div>
                    {period === "custom" && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
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

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-green-800">Évolution de la température</CardTitle>
                      <CardDescription>Données des 30 derniers jours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <LineChart data={sensorData.filter((data) => data.type === "temperature")} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-green-800">
                        Niveaux d&apos;humidité par zone
                      </CardTitle>
                      <CardDescription>Comparaison entre les zones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <BarChart />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-green-800">Distribution des données</CardTitle>
                    <CardDescription>Visualisation de la corrélation entre heure et valeurs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ScatterPlotChart data={sensorData} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-green-800">Carte des capteurs</CardTitle>
                    <CardDescription>Visualisation géographique des données</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                      <div className="text-center p-8">
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Carte interactive</h3>
                        <p className="text-sm text-gray-500">
                          Affichage de la carte avec les emplacements des capteurs et leurs valeurs actuelles. Les
                          cercles sont proportionnels aux valeurs mesurées.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge className="bg-blue-500">Humidité</Badge>
                      <Badge className="bg-orange-500">Température</Badge>
                      <Badge className="bg-green-500">Niveau d&apos;eau</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-green-800">Prédictions</CardTitle>
                    <CardDescription>Analyse prédictive basée sur les données historiques</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="h-[300px]">
                      <LineChart data={sensorData} />
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h3 className="text-lg font-medium text-green-800 mb-2">Analyse des prédictions</h3>
                      <p className="text-sm text-gray-600">
                        Selon nos modèles prédictifs, nous anticipons une augmentation de la température de 2°C dans les
                        prochains jours, ce qui pourrait affecter les niveaux d&apos;humidité. Nous recommandons
                        d&apos;augmenter l&apos;irrigation dans les zones Est et Sud pour maintenir des conditions
                        optimales pour les cultures.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  )
}
