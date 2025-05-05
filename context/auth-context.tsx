"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { auth, authService, type UserProfile } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "farmer" | "researcher",
  ) => Promise<UserProfile>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const profile = await authService.getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Erreur lors de la récupération du profil:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password)
      const profile = await authService.getUserProfile(user.uid)
      setUserProfile(profile)
      return user
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "farmer" | "researcher",
  ) => {
    try {
      const userProfile = await authService.register(email, password, firstName, lastName, role)
      setUserProfile(userProfile)
      return userProfile
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUserProfile(null)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("Utilisateur non connecté")

    try {
      await authService.updateUserProfile(user.uid, data)

      // Mettre à jour le profil local
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...data,
          updatedAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
