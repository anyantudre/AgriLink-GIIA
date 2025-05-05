"use client"

import { createContext, useContext, type ReactNode, useState, useCallback } from "react"
import { sensorService, type SensorData } from "@/lib/firebase"
import { useAuth } from "./auth-context"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SensorContextType {
  loadingSensorData: boolean
  latestSensorData: Record<string, SensorData> | null
  sensorHistory: SensorData[]
  fetchLatestSensorData: () => Promise<void>
  fetchSensorHistory: (
    type?: "humidity" | "temperature" | "water",
    location?: string,
    startDate?: Date,
    endDate?: Date,
  ) => Promise<void>
  addSensorData: (data: Omit<SensorData, "id" | "userId">) => Promise<string>
}

const SensorContext = createContext<SensorContextType | undefined>(undefined)

export function SensorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loadingSensorData, setLoadingSensorData] = useState(false)
  const [latestSensorData, setLatestSensorData] = useState<Record<string, SensorData> | null>(null)
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([])

  // Modifier la fonction fetchLatestSensorData pour récupérer les données réelles
  const fetchLatestSensorData = useCallback(async () => {
    try {
      setLoadingSensorData(true)
      // Récupérer les données réelles depuis Firebase
      const sensorDataRef = collection(db, "sensorData")
      const q = query(sensorDataRef, where("userId", "==", user?.uid || "demo-user-id"))
      const querySnapshot = await getDocs(q)

      // Organiser les données par type de capteur
      const data: Record<string, SensorData> = {}

      querySnapshot.forEach((doc) => {
        const sensorData = doc.data() as SensorData
        sensorData.id = doc.id

        // Convertir le timestamp Firestore en Date si nécessaire
        if (sensorData.timestamp && typeof sensorData.timestamp !== "object") {
          sensorData.timestamp = new Date(sensorData.timestamp)
        } else if (
          sensorData.timestamp &&
          typeof sensorData.timestamp === "object" &&
          "seconds" in sensorData.timestamp
        ) {
          sensorData.timestamp = new Date((sensorData.timestamp as any).seconds * 1000)
        }

        // Garder la donnée la plus récente pour chaque type
        if (!data[sensorData.type] || data[sensorData.type].timestamp < sensorData.timestamp) {
          data[sensorData.type] = sensorData
        }
      })

      setLatestSensorData(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des données de capteur:", error)
    } finally {
      setLoadingSensorData(false)
    }
  }, [user])

  // Modifier la fonction fetchSensorHistory pour récupérer l'historique réel
  const fetchSensorHistory = useCallback(
    async (type?: "humidity" | "temperature" | "water", location?: string, startDate?: Date, endDate?: Date) => {
      try {
        setLoadingSensorData(true)

        // Construire la requête de base
        let q = query(collection(db, "sensorData"), where("userId", "==", user?.uid || "demo-user-id"))

        // Ajouter des filtres si spécifiés
        if (type) {
          q = query(q, where("type", "==", type))
        }

        if (location) {
          q = query(q, where("location", "==", location))
        }

        const querySnapshot = await getDocs(q)
        let data: SensorData[] = []

        querySnapshot.forEach((doc) => {
          const sensorData = doc.data() as SensorData
          sensorData.id = doc.id

          // Convertir le timestamp Firestore en Date si nécessaire
          if (sensorData.timestamp && typeof sensorData.timestamp !== "object") {
            sensorData.timestamp = new Date(sensorData.timestamp)
          } else if (
            sensorData.timestamp &&
            typeof sensorData.timestamp === "object" &&
            "seconds" in sensorData.timestamp
          ) {
            sensorData.timestamp = new Date((sensorData.timestamp as any).seconds * 1000)
          }

          data.push(sensorData)
        })

        // Filtrer par date si nécessaire
        if (startDate) {
          data = data.filter((item) => item.timestamp >= startDate)
        }

        if (endDate) {
          data = data.filter((item) => item.timestamp <= endDate)
        }

        // Trier par date
        data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

        setSensorHistory(data)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des capteurs:", error)
      } finally {
        setLoadingSensorData(false)
      }
    },
    [user],
  )

  const addSensorData = useCallback(
    async (data: Omit<SensorData, "id" | "userId">) => {
      if (!user) throw new Error("Utilisateur non connecté")

      try {
        const sensorData = {
          ...data,
          userId: user.uid,
        }

        return await sensorService.addSensorData(sensorData)
      } catch (error) {
        console.error("Erreur lors de l'ajout de données de capteur:", error)
        throw error
      }
    },
    [user],
  )

  const value = {
    loadingSensorData,
    latestSensorData,
    sensorHistory,
    fetchLatestSensorData,
    fetchSensorHistory,
    addSensorData,
  }

  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>
}

export function useSensor() {
  const context = useContext(SensorContext)
  if (context === undefined) {
    throw new Error("useSensor doit être utilisé à l'intérieur d'un SensorProvider")
  }
  return context
}
