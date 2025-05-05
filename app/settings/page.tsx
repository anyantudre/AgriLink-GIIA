"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Bell, Mail, Save, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  notificationFrequency: "immediate" | "hourly" | "daily"
  language: "fr" | "en"
  theme: "light" | "dark" | "system"
  alertThresholds: {
    temperature: {
      min: number
      max: number
    }
    humidity: {
      min: number
      max: number
    }
    water: {
      min: number
      max: number
    }
  }
}

export default function SettingsPage() {
  const { userProfile, loading, updateProfile } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    notificationFrequency: "immediate",
    language: "fr",
    theme: "light",
    alertThresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      water: { min: 30, max: 90 },
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !userProfile) {
      router.push("/login")
      return
    }

    // Charger les paramètres depuis le profil utilisateur
    if (userProfile && userProfile.settings) {
      setSettings(userProfile.settings as UserSettings)
    }
  }, [userProfile, loading, router])

  const handleSaveSettings = async () => {
    if (!userProfile) return

    try {
      setIsSaving(true)
      await updateProfile({
        settings,
      })

      toast({
        title: "Paramètres enregistrés",
        description: "Vos paramètres ont été mis à jour avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des paramètres",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Paramètres</h1>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>Enregistrement...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
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
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
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
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-medium">Fréquence des notifications</Label>
                <RadioGroup
                  value={settings.notificationFrequency}
                  onValueChange={(value) =>
                    setSettings({ ...settings, notificationFrequency: value as "immediate" | "hourly" | "daily" })
                  }
                  className="flex flex-col space-y-2"
                >
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
              <CardTitle className="text-xl font-bold text-green-800">Seuils d&apos;alerte</CardTitle>
              <CardDescription>Définissez les seuils pour les alertes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Température (°C)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="temp-min">Minimum</Label>
                      <Input
                        id="temp-min"
                        type="number"
                        value={settings.alertThresholds.temperature.min}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            alertThresholds: {
                              ...settings.alertThresholds,
                              temperature: {
                                ...settings.alertThresholds.temperature,
                                min: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temp-max">Maximum</Label>
                      <Input
                        id="temp-max"
                        type="number"
                        value={settings.alertThresholds.temperature.max}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            alertThresholds: {
                              ...settings.alertThresholds,
                              temperature: {
                                ...settings.alertThresholds.temperature,
                                max: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Humidité (%)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="humidity-min">Minimum</Label>
                      <Input
                        id="humidity-min"
                        type="number"
                        value={settings.alertThresholds.humidity.min}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            alertThresholds: {
                              ...settings.alertThresholds,
                              humidity: {
                                ...settings.alertThresholds.humidity,
                                min: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="humidity-max">Maximum</Label>
                      <Input
                        id="humidity-max"
                        type="number"
                        value={settings.alertThresholds.humidity.max}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            alertThresholds: {
                              ...settings.alertThresholds,
                              humidity: {
                                ...settings.alertThresholds.humidity,
                                max: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Niveau d&apos;eau (%)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="water-min">Minimum</Label>
                      <Input
                        id="water-min"
                        type="number"
                        value={settings.alertThresholds.water.min}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            alertThresholds: {
                              ...settings.alertThresholds,
                              water: {
                                ...settings.alertThresholds.water,
                                min: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="water-max">Maximum</Label>
                      <Input
                        id="water-max"
                        type="number"
                        value={settings.alertThresholds.water.max}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            alertThresholds: {
                              ...settings.alertThresholds,
                              water: {
                                ...settings.alertThresholds.water,
                                max: Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Attention</p>
                  <p className="text-sm text-amber-700">
                    La modification des seuils d&apos;alerte peut affecter la fréquence des notifications que vous
                    recevez. Des seuils trop étroits peuvent générer de nombreuses alertes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Langue et apparence</CardTitle>
              <CardDescription>Personnalisez votre expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value as "fr" | "en" })}
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Sélectionner une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings({ ...settings, theme: value as "light" | "dark" | "system" })}
                >
                  <SelectTrigger id="theme" className="w-full">
                    <SelectValue placeholder="Sélectionner un thème" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
