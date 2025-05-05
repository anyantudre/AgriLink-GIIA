"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Camera, RefreshCw } from "lucide-react"
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function ProfilePage() {
  const { userProfile, updateProfile, loading } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"farmer" | "researcher">("farmer")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Informations supplémentaires
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [company, setCompany] = useState("")
  const [farmSize, setFarmSize] = useState("")
  const [cropTypes, setCropTypes] = useState<string>("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const { toast } = useToast()
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    if (!loading && !userProfile) {
      router.push("/login")
      return
    }

    if (userProfile) {
      setFirstName(userProfile.firstName || "")
      setLastName(userProfile.lastName || "")
      setEmail(userProfile.email || "")
      setRole(userProfile.role || "farmer")
      setAvatarUrl(userProfile.avatarUrl || "")

      // Charger les informations supplémentaires si elles existent
      if (userProfile.additionalInfo) {
        setPhone(userProfile.additionalInfo.phone || "")
        setAddress(userProfile.additionalInfo.address || "")
        setCity(userProfile.additionalInfo.city || "")
        setPostalCode(userProfile.additionalInfo.postalCode || "")
        setCompany(userProfile.additionalInfo.company || "")
        setFarmSize(userProfile.additionalInfo.farmSize || "")
        setCropTypes(
          Array.isArray(userProfile.additionalInfo.cropTypes)
            ? userProfile.additionalInfo.cropTypes.join(", ")
            : userProfile.additionalInfo.cropTypes || "",
        )
        setBio(userProfile.additionalInfo.bio || "")
      }
    }
  }, [userProfile, loading, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userProfile) return

    try {
      setIsUpdating(true)
      await updateProfile({
        firstName,
        lastName,
        role,
        avatarUrl,
        additionalInfo: {
          phone,
          address,
          city,
          postalCode,
          company,
          farmSize,
          cropTypes: cropTypes.split(",").map((item) => item.trim()),
          bio,
          updatedAt: new Date(),
        },
      })

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (!currentPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre mot de passe actuel",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingPassword(true)
      const user = auth.currentUser

      if (!user || !user.email) {
        throw new Error("Utilisateur non connecté")
      }

      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword)

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès",
      })

      // Réinitialiser les champs
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error)

      let errorMessage = "Une erreur est survenue lors de la mise à jour du mot de passe"

      if (error.code === "auth/wrong-password") {
        errorMessage = "Le mot de passe actuel est incorrect"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives échouées. Veuillez réessayer plus tard"
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleAvatarUpload = () => {
    // Simuler un clic sur l'input file caché
    document.getElementById("avatar-upload")?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userProfile) return

    try {
      setIsUploadingAvatar(true)

      // Télécharger l'image vers Firebase Storage
      const storage = getStorage()
      const storageRef = ref(storage, `avatars/${userProfile.uid}/${Date.now()}_${file.name}`)

      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      // Mettre à jour le profil avec la nouvelle URL d'avatar
      await updateProfile({
        ...userProfile,
        avatarUrl: downloadURL,
      })

      // Mettre à jour l'état local
      setAvatarUrl(downloadURL)

      toast({
        title: "Succès",
        description: "Votre photo de profil a été mise à jour",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'avatar:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement de l'avatar",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
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
            <h1 className="text-2xl font-bold tracking-tight text-green-800">Profil utilisateur</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_250px]">
            <div className="space-y-4">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
                  <TabsTrigger value="professional">Informations professionnelles</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <form onSubmit={handleProfileUpdate}>
                    <Card className="border-2 border-green-100 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-green-800">Informations personnelles</CardTitle>
                        <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Nom</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={email} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Adresse</Label>
                          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Ville</Label>
                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Code postal</Label>
                            <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Enregistrer les modifications"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </form>
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                  <form onSubmit={handleProfileUpdate}>
                    <Card className="border-2 border-green-100 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-green-800">
                          Informations professionnelles
                        </CardTitle>
                        <CardDescription>Complétez votre profil professionnel</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Entreprise / Exploitation</Label>
                          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="farmSize">Taille de l'exploitation (hectares)</Label>
                          <Input id="farmSize" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cropTypes">Types de cultures (séparés par des virgules)</Label>
                          <Input id="cropTypes" value={cropTypes} onChange={(e) => setCropTypes(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Biographie</Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Parlez-nous de vous et de votre exploitation..."
                            className="min-h-[120px]"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Enregistrer les modifications"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </form>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 mt-4">
                  <form onSubmit={handlePasswordUpdate}>
                    <Card className="border-2 border-green-100 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-green-800">Sécurité</CardTitle>
                        <CardDescription>Mettez à jour votre mot de passe</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Mettre à jour le mot de passe"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <Card className="border-2 border-green-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-green-800">Photo de profil</CardTitle>
                  <CardDescription>Ajoutez ou modifiez votre photo de profil</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    {isUploadingAvatar ? (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={`${firstName} ${lastName}`} />
                        <AvatarFallback className="bg-green-100 text-green-800 text-2xl">
                          {firstName && lastName ? `${firstName[0]}${lastName[0]}` : <User className="h-12 w-12" />}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Changer la photo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-green-800">Rôle</CardTitle>
                  <CardDescription>Votre rôle sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-800">{role === "farmer" ? "Agriculteur" : "Chercheur"}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {role === "farmer"
                        ? "Accès aux fonctionnalités de gestion des cultures et de surveillance des capteurs."
                        : "Accès aux fonctionnalités d'analyse de données et de recherche avancée."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
