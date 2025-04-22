import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Droplets, ThermometerSun, Bell, BarChart3, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-green-800">AgriLink</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-green-800 hover:text-green-600">
              Accueil
            </Link>
            <Link href="#about" className="text-sm font-medium text-green-800 hover:text-green-600">
              À propos
            </Link>
            <Link href="#features" className="text-sm font-medium text-green-800 hover:text-green-600">
              Fonctionnalités
            </Link>
            <Link href="#demo" className="text-sm font-medium text-green-800 hover:text-green-600">
              Démo
            </Link>
            <Link href="#contact" className="text-sm font-medium text-green-800 hover:text-green-600">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Connexion
              </Button>
            </Link>
            <Link href="/signup" className="hidden md:block">
              <Button className="bg-green-600 hover:bg-green-700">Inscription</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[url('/images/irrigation-field.png')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-green-800/40"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col gap-4 text-white">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Agriculture <span className="text-green-300">avec amour</span> pour la nature
                </h1>
                <p className="max-w-[700px] text-gray-200 md:text-xl">
                  Connectez vos cultures avec la technologie IoT pour une agriculture intelligente et durable.
                  Surveillez, analysez et optimisez votre exploitation en temps réel.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Link href="#about">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                      Découvrir AgriLink
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 text-white border-white hover:bg-white/20"
                    >
                      Essayer la démo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-end">
                <div className="relative w-[450px] h-[350px] rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-green-800/10 z-0"></div>
                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Optimisez votre irrigation</h3>
                    <p className="text-white/90 mb-6">
                      Économisez jusqu'à 30% d'eau grâce à nos capteurs intelligents et nos algorithmes prédictifs
                    </p>
                    <div className="flex gap-2">
                      <div className="bg-white/20 rounded-lg p-2 text-center flex-1">
                        <p className="text-sm text-white/80">Économie d'eau</p>
                        <p className="text-xl font-bold text-white">30%</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2 text-center flex-1">
                        <p className="text-sm text-white/80">Rendement</p>
                        <p className="text-xl font-bold text-white">+25%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                À propos d&apos;AgriLink
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-green-800">
                Notre mission et nos valeurs
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                Une solution complète pour connecter votre exploitation agricole au monde numérique
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card className="border-2 border-green-100 shadow-md overflow-hidden">
                <div className="h-40 bg-green-200 relative">
                  <Image
                    src="/images/irrigation-field.png"
                    alt="Surveillance en temps réel"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Droplets className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-green-800">Surveillance en temps réel</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Accédez aux données de vos capteurs en temps réel pour surveiller l&apos;humidité, la température et
                    le niveau d&apos;eau de vos cultures.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-100 shadow-md overflow-hidden">
                <div className="h-40 bg-green-200 relative">
                  <Image src="/images/drip-irrigation.png" alt="Alertes intelligentes" fill className="object-cover" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Bell className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-green-800">Alertes intelligentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Recevez des alertes personnalisées lorsque les conditions de vos cultures nécessitent votre
                    attention.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-100 shadow-md overflow-hidden">
                <div className="h-40 bg-green-200 relative">
                  <Image
                    src="/images/irrigation-field.png"
                    alt="Analyses avancées"
                    fill
                    className="object-cover object-bottom"
                  />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-green-800">Analyses avancées</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Analysez les tendances et optimisez vos pratiques agricoles grâce à des outils d&apos;analyse
                    avancés.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 mb-4">
                  Nos avantages
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-green-800 mb-6">
                  La tradition agricole rencontre la technologie moderne
                </h2>
                <p className="text-gray-600 mb-8">
                  AgriLink offre une approche alternative pour l&apos;agriculture moderne. Notre technologie
                  s&apos;appuie sur des principes durables et respectueux de l&apos;environnement, tout en utilisant les
                  dernières avancées technologiques pour optimiser vos rendements.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <ThermometerSun className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-1">Données en temps réel</h3>
                      <p className="text-gray-600 text-sm">
                        Accédez instantanément aux données de vos capteurs pour prendre des décisions éclairées.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-1">Système d&apos;alertes</h3>
                      <p className="text-gray-600 text-sm">
                        Soyez informé immédiatement lorsque les conditions de vos cultures changent.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-1">Prédictions avancées</h3>
                      <p className="text-gray-600 text-sm">
                        Anticipez les besoins de vos cultures grâce à nos algorithmes de prédiction.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Leaf className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-1">Agriculture durable</h3>
                      <p className="text-gray-600 text-sm">
                        Optimisez votre consommation d&apos;eau et réduisez votre impact environnemental.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden h-[500px]">
                <Image
                  src="/images/drip-irrigation.png"
                  alt="Irrigation goutte à goutte"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="w-full py-12 md:py-24 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                Accès démo
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-green-800">
                Essayez nos tableaux de bord
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                Découvrez les fonctionnalités d&apos;AgriLink sans inscription
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 border-green-100 shadow-lg overflow-hidden">
                <div className="h-48 bg-green-700 relative">
                  <Image
                    src="/images/irrigation-field.png"
                    alt="Dashboard Agriculteur"
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">Dashboard Agriculteur</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">
                    Accédez à un tableau de bord conçu pour les agriculteurs, avec des données en temps réel sur vos
                    cultures, des alertes et des recommandations personnalisées.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      </div>
                      Surveillance des capteurs en temps réel
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      </div>
                      Alertes et notifications
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      </div>
                      Filtres et personnalisation
                    </li>
                  </ul>
                  <Link href="/dashboard/farmer">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Accéder au dashboard Agriculteur</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 shadow-lg overflow-hidden">
                <div className="h-48 bg-green-800 relative">
                  <Image
                    src="/images/drip-irrigation.png"
                    alt="Dashboard Chercheur"
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">Dashboard Chercheur</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">
                    Explorez un tableau de bord avancé conçu pour les chercheurs, avec des outils d&apos;analyse de
                    données, des graphiques interactifs et des modèles prédictifs.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      </div>
                      Graphiques et visualisations avancés
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      </div>
                      Carte interactive des capteurs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      </div>
                      Modèles prédictifs et analyses
                    </li>
                  </ul>
                  <Link href="/dashboard/researcher">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Accéder au dashboard Chercheur</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-[url('/images/irrigation-field.png')] bg-cover bg-center relative text-white">
          <div className="absolute inset-0 bg-green-900/80"></div>
          <div className="container px-4 md:px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Prêt à transformer votre exploitation agricole ?
            </h2>
            <p className="max-w-[700px] text-gray-100 md:text-xl/relaxed mx-auto mb-8">
              Rejoignez AgriLink dès aujourd&apos;hui et découvrez comment la technologie peut améliorer votre
              productivité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                  Tester gratuitement
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-green-600">
                  Voir la démo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-green-900 text-white">
        <div className="container py-10 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6" />
                <span className="text-xl font-bold">AgriLink</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                La technologie au service de l&apos;agriculture durable et responsable.
              </p>
              <p className="text-sm text-gray-300">© 2025 AgriLink. Tous droits réservés.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-gray-300 hover:text-white">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-sm text-gray-300 hover:text-white">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-sm text-gray-300 hover:text-white">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="text-sm text-gray-300 hover:text-white">
                    Démo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Dashboards</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/farmer" className="text-sm text-gray-300 hover:text-white">
                    Dashboard Agriculteur
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/researcher" className="text-sm text-gray-300 hover:text-white">
                    Dashboard Chercheur
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-300">123 Rue de l&apos;Agriculture, 75000 Paris</li>
                <li className="text-sm text-gray-300">contact@agrilink.com</li>
                <li className="text-sm text-gray-300">+33 1 23 45 67 89</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
