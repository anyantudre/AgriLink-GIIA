import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf } from "lucide-react"

export default function LoginPage() {
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
            <CardTitle className="text-2xl font-bold text-green-800">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="exemple@email.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="#" className="text-sm text-green-600 hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-green-600 hover:bg-green-700">Se connecter</Button>
            <div className="text-center text-sm">
              Vous n&apos;avez pas de compte?{" "}
              <Link href="/signup" className="text-green-600 hover:underline">
                S&apos;inscrire
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
