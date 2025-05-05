"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Type pour les données de capteurs
interface SensorDataPoint {
  id?: string
  sensorId: string
  type: string
  value: number
  unit: string
  location: string
  timestamp: Date | any
  userId: string
}

// Fonction pour formater les données pour les graphiques
const formatChartData = (data: SensorDataPoint[]) => {
  // Trier par date (du plus ancien au plus récent)
  const sortedData = [...data].sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp.seconds * 1000)
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp.seconds * 1000)
    return dateA.getTime() - dateB.getTime()
  })

  // Formater les données pour le graphique
  return sortedData.map((item) => {
    const date = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp.seconds * 1000)

    return {
      name: format(date, "dd/MM HH:mm", { locale: fr }),
      value: item.value,
      type: item.type,
      location: item.location,
      timestamp: date,
    }
  })
}

// Composant LineChart amélioré qui accepte des données directement
export function LineChart({ data = [] }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(formatChartData(data))
      setLoading(false)
    } else {
      // Si aucune donnée n'est fournie, charger des données par défaut
      async function fetchDefaultData() {
        try {
          const tempQuery = query(collection(db, "sensorData"), where("type", "==", "temperature"))
          const humidityQuery = query(collection(db, "sensorData"), where("type", "==", "humidity"))

          const [tempSnapshot, humiditySnapshot] = await Promise.all([getDocs(tempQuery), getDocs(humidityQuery)])

          const tempData = []
          const humidityData = []

          tempSnapshot.forEach((doc) => {
            const data = doc.data()
            tempData.push({
              ...data,
              id: doc.id,
              timestamp: data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            })
          })

          humiditySnapshot.forEach((doc) => {
            const data = doc.data()
            humidityData.push({
              ...data,
              id: doc.id,
              timestamp: data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            })
          })

          const combinedData = [...tempData, ...humidityData]
          setChartData(formatChartData(combinedData))
        } catch (error) {
          console.error("Erreur lors du chargement des données par défaut:", error)
          // Générer des données fictives en cas d'erreur
          const mockData = Array.from({ length: 10 }).map((_, i) => ({
            name: format(new Date(Date.now() - i * 3600000), "dd/MM HH:mm", { locale: fr }),
            value: Math.floor(Math.random() * 30) + 10,
            type: i % 2 === 0 ? "temperature" : "humidity",
            location: i % 3 === 0 ? "Zone Nord" : i % 3 === 1 ? "Zone Sud" : "Zone Est",
          }))
          setChartData(mockData)
        } finally {
          setLoading(false)
        }
      }

      fetchDefaultData()
    }
  }, [data])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Chargement des données...</div>
  }

  // Regrouper les données par type
  const temperatureData = chartData.filter((item) => item.type === "temperature")
  const humidityData = chartData.filter((item) => item.type === "humidity")
  const waterData = chartData.filter((item) => item.type === "water")

  // Créer un ensemble de noms uniques pour l'axe X
  const allNames = new Set(chartData.map((item) => item.name))
  const xAxisData = Array.from(allNames)

  // Créer un tableau de données combinées pour l'affichage
  const combinedData = xAxisData.map((name) => {
    const dataPoint = { name }

    const tempPoint = temperatureData.find((item) => item.name === name)
    if (tempPoint) dataPoint.temperature = tempPoint.value

    const humidityPoint = humidityData.find((item) => item.name === name)
    if (humidityPoint) dataPoint.humidity = humidityPoint.value

    const waterPoint = waterData.find((item) => item.name === name)
    if (waterPoint) dataPoint.water = waterPoint.value

    return dataPoint
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {temperatureData.length > 0 && (
          <Line type="monotone" dataKey="temperature" name="Température (°C)" stroke="#FF8042" activeDot={{ r: 8 }} />
        )}
        {humidityData.length > 0 && (
          <Line type="monotone" dataKey="humidity" name="Humidité (%)" stroke="#0088FE" activeDot={{ r: 8 }} />
        )}
        {waterData.length > 0 && (
          <Line type="monotone" dataKey="water" name="Niveau d'eau (%)" stroke="#00C49F" activeDot={{ r: 8 }} />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// Modifier la fonction BarChart pour éviter l'erreur d'index
export function BarChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer les données d'humidité sans orderBy pour éviter l'erreur d'index
        const humidityQuery = query(collection(db, "sensorData"), where("type", "==", "humidity"))

        const snapshot = await getDocs(humidityQuery)

        // Organiser les données par zone
        const zoneData: Record<string, { count: number; total: number }> = {}

        snapshot.forEach((doc) => {
          const data = doc.data() as SensorDataPoint
          if (!zoneData[data.location]) {
            zoneData[data.location] = { count: 0, total: 0 }
          }

          zoneData[data.location].count += 1
          zoneData[data.location].total += data.value
        })

        // Calculer la moyenne par zone
        const barData = Object.entries(zoneData).map(([zone, data]) => ({
          name: zone,
          humidity: Math.round(data.total / data.count),
        }))

        setChartData(barData)
      } catch (error) {
        console.error("Erreur lors de la récupération des données pour le graphique:", error)
        // Générer des données fictives en cas d'erreur
        const mockData = [
          { name: "Zone Nord", humidity: 75 },
          { name: "Zone Sud", humidity: 68 },
          { name: "Zone Est", humidity: 82 },
          { name: "Zone Ouest", humidity: 65 },
        ]
        setChartData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Chargement des données...</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="humidity" name="Humidité (%)" fill="#0088FE" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function HeatmapChart() {
  const [heatmapData, setHeatmapData] = useState<number[][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer les données de température et d'humidité
        const dataQuery = query(collection(db, "sensorData"), where("type", "in", ["temperature", "humidity"]))

        const snapshot = await getDocs(dataQuery)

        // Organiser les données pour la heatmap
        const tempData: Record<string, number> = {}
        const humidityData: Record<string, number> = {}

        snapshot.forEach((doc) => {
          const data = doc.data() as SensorDataPoint
          const date = new Date(data.timestamp.seconds * 1000)
          const hour = date.getHours()
          const day = date.getDate() % 10 // Utiliser le modulo pour limiter à 10 jours
          const key = `${day}-${hour}`

          if (data.type === "temperature") {
            tempData[key] = data.value
          } else if (data.type === "humidity") {
            humidityData[key] = data.value
          }
        })

        // Créer la matrice de données pour la heatmap
        const rows = 10
        const cols = 24
        const matrix: number[][] = []

        for (let i = 0; i < rows; i++) {
          const row: number[] = []
          for (let j = 0; j < cols; j++) {
            const key = `${i}-${j}`
            // Combiner température et humidité, ou utiliser une valeur aléatoire si pas de données
            const temp = tempData[key] || Math.floor(Math.random() * 15) + 15
            const humidity = humidityData[key] || Math.floor(Math.random() * 40) + 40
            // Valeur combinée pour la heatmap (plus la valeur est élevée, plus c'est chaud/sec)
            row.push(Math.floor((temp / 40) * 50 + (100 - humidity) / 2))
          }
          matrix.push(row)
        }

        setHeatmapData(matrix)
      } catch (error) {
        console.error("Erreur lors de la récupération des données pour la heatmap:", error)
        // Générer des données aléatoires en cas d'erreur
        const rows = 10
        const cols = 24
        const matrix: number[][] = []

        for (let i = 0; i < rows; i++) {
          const row: number[] = []
          for (let j = 0; j < cols; j++) {
            row.push(Math.floor(Math.random() * 100))
          }
          matrix.push(row)
        }

        setHeatmapData(matrix)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Chargement des données...</div>
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="text-xs text-gray-500 mb-1">Température (°C)</div>
        <div className="flex-1 grid grid-rows-10 gap-1">
          {heatmapData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 h-full">
              {row.map((value, colIndex) => {
                // Calculer la couleur en fonction de la valeur
                // Rouge pour les valeurs élevées, bleu pour les valeurs basses
                const r = Math.floor((value / 100) * 255)
                const b = Math.floor(((100 - value) / 100) * 255)
                const backgroundColor = `rgb(${r}, 100, ${b})`

                return (
                  <div
                    key={colIndex}
                    className="flex-1 rounded-sm"
                    style={{ backgroundColor }}
                    title={`Température: ${Math.floor(value / 5 + 15)}°C, Humidité: ${value}%`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">Heure de la journée</div>
      </div>
    </div>
  )
}

// Nouveau composant pour afficher un graphique de dispersion
export function ScatterPlotChart({ data = [] }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (data && data.length > 0) {
      // Formater les données pour le graphique de dispersion
      const formattedData = data.map((item) => {
        const timestamp = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp.seconds * 1000)

        return {
          x: timestamp.getHours() + timestamp.getMinutes() / 60, // Heure de la journée
          y: item.value,
          z: item.type === "temperature" ? 200 : item.type === "humidity" ? 100 : 50,
          name: format(timestamp, "dd/MM HH:mm", { locale: fr }),
          type: item.type,
          location: item.location,
        }
      })

      // Regrouper par type
      const temperatureData = formattedData.filter((item) => item.type === "temperature")
      const humidityData = formattedData.filter((item) => item.type === "humidity")
      const waterData = formattedData.filter((item) => item.type === "water")

      setChartData([
        { name: "Température", data: temperatureData },
        { name: "Humidité", data: humidityData },
        { name: "Niveau d'eau", data: waterData },
      ])
      setLoading(false)
    } else {
      // Générer des données fictives
      const mockData = [
        {
          name: "Température",
          data: Array.from({ length: 20 }).map(() => ({
            x: Math.random() * 24,
            y: Math.random() * 20 + 10,
            z: 200,
            name: "Température",
            type: "temperature",
          })),
        },
        {
          name: "Humidité",
          data: Array.from({ length: 20 }).map(() => ({
            x: Math.random() * 24,
            y: Math.random() * 40 + 40,
            z: 100,
            name: "Humidité",
            type: "humidity",
          })),
        },
      ]
      setChartData(mockData)
      setLoading(false)
    }
  }, [data])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Chargement des données...</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="x"
          name="Heure"
          domain={[0, 24]}
          tickFormatter={(value) => `${Math.floor(value)}h`}
        />
        <YAxis type="number" dataKey="y" name="Valeur" />
        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Type" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value, name) => [value, name === "x" ? "Heure" : name === "y" ? "Valeur" : "Type"]}
          labelFormatter={(label) => "Données"}
        />
        <Legend />
        {chartData.map((entry, index) => (
          <Scatter
            key={`scatter-${index}`}
            name={entry.name}
            data={entry.data}
            fill={entry.name === "Température" ? "#FF8042" : entry.name === "Humidité" ? "#0088FE" : "#00C49F"}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export function AreaChart() {
  return <div>AreaChart Placeholder</div>
}
