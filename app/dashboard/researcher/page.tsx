import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { AreaChart, BarChart, HeatmapChart } from "@/components/charts"
import { Download, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ResearcherDashboard() {
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
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                <Download className="mr-2 h-4 w-4" />
                Télécharger CSV
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Actualiser
              </Button>
            </div>
          </div>

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
                    <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      Appliquer les filtres
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sensorType">Type de capteur</Label>
                      <Select defaultValue="all">
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
                      <Select defaultValue="all">
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Sélectionner un emplacement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les emplacements</SelectItem>
                          <SelectItem value="north">Zone Nord</SelectItem>
                          <SelectItem value="south">Zone Sud</SelectItem>
                          <SelectItem value="east">Zone Est</SelectItem>
                          <SelectItem value="west">Zone Ouest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period">Période</Label>
                      <Select defaultValue="month">
                        <SelectTrigger id="period">
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Aujourd&apos;hui</SelectItem>
                          <SelectItem value="week">Cette semaine</SelectItem>
                          <SelectItem value="month">Ce mois</SelectItem>
                          <SelectItem value="year">Cette année</SelectItem>
                          <SelectItem value="custom">Personnalisée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
                      <AreaChart />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-green-800">Niveaux d&apos;humidité par zone</CardTitle>
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
                  <CardTitle className="text-lg font-bold text-green-800">Heatmap des conditions</CardTitle>
                  <CardDescription>Visualisation de la corrélation entre température et humidité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <HeatmapChart />
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
                        Affichage de la carte avec les emplacements des capteurs et leurs valeurs actuelles. Les cercles
                        sont proportionnels aux valeurs mesurées.
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
                    <AreaChart />
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
        </main>
      </div>
    </div>
  )
}
