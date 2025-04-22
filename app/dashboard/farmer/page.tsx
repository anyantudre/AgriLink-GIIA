import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Droplets, ThermometerSun, Waves, TrendingUp, Minus, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FarmerDashboard() {
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
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                Exporter
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Actualiser
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-green-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Humidité du sol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-8 w-8 text-blue-500" />
                    <div className="text-3xl font-bold">68%</div>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>+2%</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">Dernière mise à jour: il y a 5 minutes</p>
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
                    <div className="text-3xl font-bold">24°C</div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-200 bg-red-50">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>+3°C</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">Dernière mise à jour: il y a 5 minutes</p>
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
                    <div className="text-3xl font-bold">85%</div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 text-gray-600 border-gray-200 bg-gray-50">
                    <Minus className="h-3.5 w-3.5" />
                    <span>Stable</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">Dernière mise à jour: il y a 5 minutes</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-green-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-green-800">Filtres</CardTitle>
                <CardDescription>Affinez les données affichées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensor">Capteur</Label>
                    <Select defaultValue="all">
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
                    <Label htmlFor="period">Période</Label>
                    <Select defaultValue="day">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">Appliquer</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-green-800">Alertes</CardTitle>
                    <CardDescription>Notifications récentes</CardDescription>
                  </div>
                  <Badge className="bg-red-500">3 nouvelles</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-red-50 border border-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-red-800">Alerte température élevée</h4>
                        <span className="text-xs text-gray-500">Il y a 10 min</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">La température a dépassé 30°C dans la zone Est.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Marquer comme lue
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-amber-800">Alerte humidité basse</h4>
                        <span className="text-xs text-gray-500">Il y a 45 min</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        L'humidité du sol est descendue sous 30% dans la zone Ouest.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
                      >
                        Marquer comme lue
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-blue-800">Alerte niveau d&apos;eau</h4>
                        <span className="text-xs text-gray-500">Il y a 2h</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Le niveau d&apos;eau du réservoir principal est à 15%.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        Marquer comme lue
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
