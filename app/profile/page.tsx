import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardNav />
        <main className="flex w-full flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Profil utilisateur</h1>
            <Button className="bg-green-600 hover:bg-green-700">Enregistrer les modifications</Button>
          </div>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue="Jean" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue="Dupont" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="jean.dupont@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <RadioGroup defaultValue="farmer" className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                    <RadioGroupItem value="farmer" id="farmer-profile" />
                    <Label htmlFor="farmer-profile" className="flex-1 cursor-pointer">
                      Agriculteur
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                    <RadioGroupItem value="researcher" id="researcher-profile" />
                    <Label htmlFor="researcher-profile" className="flex-1 cursor-pointer">
                      Chercheur
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800">Sécurité</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700">Mettre à jour le mot de passe</Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  )
}
