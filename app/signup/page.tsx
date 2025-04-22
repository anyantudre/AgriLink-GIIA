import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Leaf } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 bg-green-50">
        <Card className="w-full max-w-md border-2 border-green-100 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-xl font-bold text-green-800">AgriLink</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">Créer un compte</CardTitle>
            <CardDescription>Rejoignez AgriLink pour commencer à surveiller vos cultures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" placeholder="Jean" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" placeholder="Dupont" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="exemple@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <RadioGroup defaultValue="farmer" className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                  <RadioGroupItem value="farmer" id="farmer" />
                  <Label htmlFor="farmer" className="flex-1 cursor-pointer">
                    Agriculteur
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-green-50">
                  <RadioGroupItem value="researcher" id="researcher" />
                  <Label htmlFor="researcher" className="flex-1 cursor-pointer">
                    Chercheur
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-green-600 hover:bg-green-700">S&apos;inscrire</Button>
            <div className="text-center text-sm">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="text-green-600 hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <footer className="border-t bg-white py-4 text-center text-sm text-gray-600">
        <div className="container">© 2025 AgriLink. Tous droits réservés.</div>
      </footer>
    </div>
  )
}
