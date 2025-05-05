"use client"

import { createContext, useContext, type ReactNode, useState, useCallback, useEffect } from "react"
import type { Alert } from "@/lib/firebase"
import { useAuth } from "./auth-context"
import { collection, doc, getDocs, query, updateDoc, where, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface AlertContextType {
  loadingAlerts: boolean
  alerts: Alert[]
  unreadAlertsCount: number
  fetchAlerts: (isRead?: boolean) => Promise<void>
  markAlertAsRead: (alertId: string) => Promise<void>
  addAlert: (alert: Omit<Alert, "id" | "userId">) => Promise<string>
  formatAlertTime: (timestamp: any) => string
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Fonction pour formater le temps des alertes
  const formatAlertTime = useCallback((timestamp: any) => {
    try {
      // Convertir le timestamp en Date si ce n'est pas déjà le cas
      let date: Date

      if (timestamp instanceof Date) {
        date = timestamp
      } else if (typeof timestamp === "object" && timestamp && "seconds" in timestamp) {
        // Timestamp Firestore
        date = new Date((timestamp as any).seconds * 1000)
      } else if (typeof timestamp === "number") {
        // Timestamp en millisecondes
        date = new Date(timestamp)
      } else if (typeof timestamp === "string") {
        // Chaîne de date
        date = new Date(timestamp)
      } else {
        // Fallback
        return "Date inconnue"
      }

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return "Date inconnue"
      }

      // Calculer la différence en minutes
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))

      if (diffMinutes < 1) {
        return "À l'instant"
      } else if (diffMinutes < 60) {
        return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
      } else if (diffMinutes < 1440) {
        // moins de 24h
        const hours = Math.floor(diffMinutes / 60)
        return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`
      } else {
        const days = Math.floor(diffMinutes / 1440)
        return `Il y a ${days} jour${days > 1 ? "s" : ""}`
      }
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return "Date inconnue"
    }
  }, [])

  // Fonction pour récupérer les alertes
  const fetchAlerts = useCallback(
    async (isRead?: boolean) => {
      if (!user && !user?.uid) {
        console.log("Aucun utilisateur connecté, impossible de récupérer les alertes")
        return
      }

      try {
        setLoadingAlerts(true)
        console.log("Début du chargement des alertes pour l'utilisateur:", user?.uid)

        // Construire la requête de base
        let q = query(collection(db, "alerts"), where("userId", "==", user?.uid))

        // Ajouter le filtre isRead si spécifié
        if (isRead !== undefined) {
          q = query(q, where("isRead", "==", isRead))
        }

        const querySnapshot = await getDocs(q)
        const fetchedAlerts: Alert[] = []

        querySnapshot.forEach((doc) => {
          const alert = doc.data() as Alert
          alert.id = doc.id

          // Convertir correctement le timestamp Firestore en Date
          if (alert.timestamp) {
            if (typeof alert.timestamp === "object" && "seconds" in alert.timestamp) {
              // C'est un timestamp Firestore
              alert.timestamp = new Date((alert.timestamp as any).seconds * 1000)
            } else if (!(alert.timestamp instanceof Date)) {
              // C'est peut-être une chaîne ou un nombre
              alert.timestamp = new Date(alert.timestamp)
            }
          } else {
            // Pas de timestamp, utiliser la date actuelle
            alert.timestamp = new Date()
          }

          fetchedAlerts.push(alert)
        })

        // Trier par date (plus récent en premier)
        fetchedAlerts.sort((a, b) => {
          return b.timestamp.getTime() - a.timestamp.getTime()
        })

        console.log(`${fetchedAlerts.length} alertes récupérées`)
        setAlerts(fetchedAlerts)
      } catch (error) {
        console.error("Erreur lors de la récupération des alertes:", error)
      } finally {
        setLoadingAlerts(false)
        console.log("Fin du chargement des alertes")
      }
    },
    [user],
  )

  // Charger les alertes au chargement du composant si un utilisateur est connecté
  useEffect(() => {
    if (user?.uid) {
      fetchAlerts()
    }
  }, [user, fetchAlerts])

  // Fonction pour marquer une alerte comme lue
  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      // Mettre à jour dans Firebase
      const alertRef = doc(db, "alerts", alertId)
      await updateDoc(alertRef, {
        isRead: true,
      })

      // Mettre à jour l'état local
      setAlerts((prevAlerts) => prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))

      return Promise.resolve()
    } catch (error) {
      console.error("Erreur lors du marquage de l'alerte comme lue:", error)
      return Promise.reject(error)
    }
  }, [])

  // Fonction pour ajouter une alerte
  const addAlert = useCallback(
    async (alert: Omit<Alert, "id" | "userId">) => {
      if (!user) throw new Error("Utilisateur non connecté")

      try {
        const newAlert = {
          ...alert,
          userId: user.uid,
          timestamp: new Date(),
        }

        // Ajouter l'alerte à Firestore
        const alertsRef = collection(db, "alerts")
        const docRef = await addDoc(alertsRef, {
          ...newAlert,
          timestamp: Timestamp.fromDate(newAlert.timestamp),
        })

        // Mettre à jour l'état local
        setAlerts((prevAlerts) => [{ ...newAlert, id: docRef.id } as Alert, ...prevAlerts])

        return docRef.id
      } catch (error) {
        console.error("Erreur lors de l'ajout d'une alerte:", error)
        throw error
      }
    },
    [user],
  )

  // Calculer le nombre d'alertes non lues
  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length

  const value = {
    loadingAlerts,
    alerts,
    unreadAlertsCount,
    fetchAlerts,
    markAlertAsRead,
    addAlert,
    formatAlertTime,
  }

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error("useAlert doit être utilisé à l'intérieur d'un AlertProvider")
  }
  return context
}
