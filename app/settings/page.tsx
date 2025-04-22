import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Bell, Mail, Globe } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Paramètres</h1>
            <Button className="bg-green-600 hover:bg-green-700">Enregistrer les modifications</Button>
          </div>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Notifications par email
                    </Label>
                    <p className="text-sm text-gray-500">Recevez des alertes par email</p>
                  </div>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-4">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label htmlFor="push-notifications" className="font-medium">
                      Notifications push
                    </Label>
                    <p className="text-sm text-gray-500">Recevez des alertes sur votre appareil</p>
                  </div>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-medium">Fréquence des notifications</Label>
                <RadioGroup defaultValue="immediate" className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                      Immédiate
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                      Toutes les heures
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="flex-1 cursor-pointer">
                      Quotidienne
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Langue</CardTitle>
              <CardDescription>Choisissez votre langue préférée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-gray-500" />
                <RadioGroup defaultValue="fr" className="flex flex-row space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fr" id="fr" />
                    <Label htmlFor="fr" className="cursor-pointer">
                      Français
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
