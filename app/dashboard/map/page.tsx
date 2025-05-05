"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useSensor } from "@/context/sensor-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets, ThermometerSun, Waves } from "lucide-react"

export default function MapPage() {
  const { userProfile, loading } = useAuth()
  const { latestSensorData, fetchLatestSensorData, loadingSensorData } = useSensor()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!loading && !userProfile) {
      router.push("/login")
      return
    }

    fetchLatestSensorData()
  }, [userProfile, loading, router, fetchLatestSensorData])

  // Données fictives pour la carte
  const sensorLocations = [
    { id: 1, name: "Capteur 1", x: 20, y: 30, type: "humidity", value: 68, location: "Zone Nord" },
    { id: 2, name: "Capteur 2", x: 50, y: 20, type: "temperature", value: 24, location: "Zone Est" },
    { id: 3, name: "Capteur 3", x: 80, y: 40, type: "water", value: 85, location: "Zone Sud" },
    { id: 4, name: "Capteur 4", x: 30, y: 70, type: "humidity", value: 72, location: "Zone Ouest" },
    { id: 5, name: "Capteur 5", x: 60, y: 60, type: "temperature", value: 22, location: "Zone Nord" },
    { id: 6, name: "Capteur 6", x: 75, y: 80, type: "water", value: 90, location: "Zone Est" },
  ]

  // Filtrer les capteurs en fonction de l'onglet actif
  const filteredSensors =
    activeTab === "all" ? sensorLocations : sensorLocations.filter((sensor) => sensor.type === activeTab)

  // Fonction pour obtenir la couleur en fonction du type de capteur
  const getSensorColor = (type: string) => {
    switch (type) {
      case "humidity":
        return "blue"
      case "temperature":
        return "orange"
      case "water":
        return "green"
      default:
        return "gray"
    }
  }

  // Fonction pour obtenir la taille du cercle en fonction de la valeur
  const getSensorSize = (value: number) => {
    return Math.max(20, Math.min(40, value / 3))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Carte des capteurs</h1>
          </div>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Visualisation géographique</CardTitle>
              <CardDescription>Emplacement et valeurs actuelles des capteurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="humidity" className="flex items-center">
                    <Droplets className="mr-2 h-4 w-4" />
                    Humidité
                  </TabsTrigger>
                  <TabsTrigger value="temperature" className="flex items-center">
                    <ThermometerSun className="mr-2 h-4 w-4" />
                    Température
                  </TabsTrigger>
                  <TabsTrigger value="water" className="flex items-center">
                    <Waves className="mr-2 h-4 w-4" />
                    Eau
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {loadingSensorData ? (
                <div className="flex items-center justify-center h-[500px]">Chargement de la carte...</div>
              ) : (
                <div className="relative w-full h-[500px] bg-green-50 rounded-lg border border-green-100 overflow-hidden">
                  {/* Fond de carte stylisé */}
                  <div className="absolute inset-0 bg-[url('/images/irrigation-field.png')] bg-cover bg-center opacity-20"></div>

                  {/* Grille */}
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                    {Array.from({ length: 100 }).map((_, index) => (
                      <div key={index} className="border border-green-200/20"></div>
                    ))}
                  </div>

                  {/* Zones */}
                  <div className="absolute top-5 left-5 p-2 bg-white/80 rounded text-xs font-medium">Zone Nord</div>
                  <div className="absolute top-5 right-5 p-2 bg-white/80 rounded text-xs font-medium">Zone Est</div>
                  <div className="absolute bottom-5 left-5 p-2 bg-white/80 rounded text-xs font-medium">Zone Ouest</div>
                  <div className="absolute bottom-5 right-5 p-2 bg-white/80 rounded text-xs font-medium">Zone Sud</div>

                  {/* Capteurs */}
                  {filteredSensors.map((sensor) => {
                    const color = getSensorColor(sensor.type)
                    const size = getSensorSize(sensor.value)

                    return (
                      <div
                        key={sensor.id}
                        className={`absolute rounded-full bg-${color}-500 flex items-center justify-center text-white font-bold cursor-pointer hover:z-10 transition-all duration-200 hover:scale-110`}
                        style={{
                          left: `${sensor.x}%`,
                          top: `${sensor.y}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        title={`${sensor.name} - ${sensor.location} - ${sensor.value}${sensor.type === "temperature" ? "°C" : "%"}`}
                      >
                        {sensor.id}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-blue-500">Humidité</Badge>
                <Badge className="bg-orange-500">Température</Badge>
                <Badge className="bg-green-500">Niveau d'eau</Badge>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                La taille des cercles est proportionnelle à la valeur mesurée. Survolez un capteur pour voir les
                détails.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Légende des zones</CardTitle>
              <CardDescription>Informations sur les différentes zones de culture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-md">
                  <h3 className="font-medium text-green-800">Zone Nord</h3>
                  <p className="text-sm text-gray-600">Culture principale: Tomates</p>
                  <p className="text-sm text-gray-600">Surface: 2.5 hectares</p>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <h3 className="font-medium text-green-800">Zone Est</h3>
                  <p className="text-sm text-gray-600">Culture principale: Maïs</p>
                  <p className="text-sm text-gray-600">Surface: 3 hectares</p>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <h3 className="font-medium text-green-800">Zone Sud</h3>
                  <p className="text-sm text-gray-600">Culture principale: Blé</p>
                  <p className="text-sm text-gray-600">Surface: 4 hectares</p>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <h3 className="font-medium text-green-800">Zone Ouest</h3>
                  <p className="text-sm text-gray-600">Culture principale: Pommes de terre</p>
                  <p className="text-sm text-gray-600">Surface: 2 hectares</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
