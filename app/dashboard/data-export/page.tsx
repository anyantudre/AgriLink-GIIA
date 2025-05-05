"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Download, FileSpreadsheet, FileJson, Filter, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useSensor } from "@/context/sensor-context"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatShortDate } from "@/utils/date-utils"

export default function DataExportPage() {
  const { userProfile, loading } = useAuth()
  const { sensorHistory, fetchSensorHistory, loadingSensorData } = useSensor()
  const router = useRouter()

  const [sensorType, setSensorType] = useState<string>("all")
  const [location, setLocation] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [exportFormat, setExportFormat] = useState<string>("csv")

  useEffect(() => {
    if (!loading && !userProfile) {
      router.push("/login")
      return
    }

    // Charger les données initiales
    fetchSensorHistory()
  }, [userProfile, loading, router, fetchSensorHistory])

  const handleApplyFilters = () => {
    const type = sensorType !== "all" ? (sensorType as "humidity" | "temperature" | "water") : undefined
    const loc = location !== "all" ? location : undefined
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    fetchSensorHistory(type, loc, start, end)
  }

  const handleExport = () => {
    if (sensorHistory.length === 0) {
      alert("Aucune donnée à exporter")
      return
    }

    // Préparer les données pour l'export
    const dataToExport = sensorHistory.map((item) => ({
      id: item.id,
      type: item.type,
      value: item.value,
      unit: item.unit,
      location: item.location,
      date: formatShortDate(item.timestamp),
      time: format(new Date(item.timestamp), "HH:mm:ss", { locale: fr }),
    }))

    if (exportFormat === "csv") {
      exportCSV(dataToExport)
    } else {
      exportJSON(dataToExport)
    }
  }

  const exportCSV = (data: any[]) => {
    // Créer l'en-tête CSV
    const headers = Object.keys(data[0]).join(",")
    // Créer les lignes de données
    const rows = data.map((item) => Object.values(item).join(","))
    // Combiner l'en-tête et les lignes
    const csv = [headers, ...rows].join("\n")

    // Créer un blob et télécharger
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `agrilink_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportJSON = (data: any[]) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `agrilink_export_${format(new Date(), "yyyy-MM-dd")}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Exportation des données</h1>
          </div>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Filtres d'exportation</CardTitle>
              <CardDescription>Sélectionnez les données que vous souhaitez exporter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="water">Niveau d'eau</SelectItem>
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
                      <SelectItem value="Zone Nord">Zone Nord</SelectItem>
                      <SelectItem value="Zone Sud">Zone Sud</SelectItem>
                      <SelectItem value="Zone Est">Zone Est</SelectItem>
                      <SelectItem value="Zone Ouest">Zone Ouest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <div className="flex">
                    <Calendar className="mr-2 h-4 w-4 mt-3 text-gray-500" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <div className="flex">
                    <Calendar className="mr-2 h-4 w-4 mt-3 text-gray-500" />
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleApplyFilters}
                disabled={loadingSensorData}
              >
                <Filter className="mr-2 h-4 w-4" />
                Appliquer les filtres
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Format d'exportation</CardTitle>
              <CardDescription>Choisissez le format dans lequel vous souhaitez exporter vos données</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="csv" value={exportFormat} onValueChange={setExportFormat}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="csv" className="flex items-center">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                  </TabsTrigger>
                  <TabsTrigger value="json" className="flex items-center">
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="csv" className="mt-4">
                  <p className="text-sm text-gray-600">
                    Le format CSV (Comma-Separated Values) est idéal pour l'importation dans des tableurs comme Excel ou
                    Google Sheets.
                  </p>
                </TabsContent>
                <TabsContent value="json" className="mt-4">
                  <p className="text-sm text-gray-600">
                    Le format JSON est idéal pour l'intégration avec d'autres applications ou pour l'analyse de données.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Aperçu des données</CardTitle>
              <CardDescription>{sensorHistory.length} enregistrements correspondent à vos critères</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSensorData ? (
                <div className="flex items-center justify-center h-40">Chargement des données...</div>
              ) : sensorHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune donnée ne correspond à vos critères. Veuillez modifier vos filtres.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Type</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Valeur</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Unité</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Emplacement</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensorHistory.slice(0, 5).map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-4 text-sm">{item.type}</td>
                          <td className="py-2 px-4 text-sm">{item.value}</td>
                          <td className="py-2 px-4 text-sm">{item.unit}</td>
                          <td className="py-2 px-4 text-sm">{item.location}</td>
                          <td className="py-2 px-4 text-sm">{formatShortDate(item.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sensorHistory.length > 5 && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      ... et {sensorHistory.length - 5} autres enregistrements
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            className="bg-green-600 hover:bg-green-700 w-full md:w-auto md:self-end"
            onClick={handleExport}
            disabled={loadingSensorData || sensorHistory.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter les données
          </Button>
        </main>
      </div>
    </div>
  )
}
