"use client"

import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Données fictives pour les graphiques
const areaChartData = [
  { name: "1 Mai", value: 22, value2: 65 },
  { name: "5 Mai", value: 24, value2: 63 },
  { name: "10 Mai", value: 25, value2: 62 },
  { name: "15 Mai", value: 23, value2: 64 },
  { name: "20 Mai", value: 26, value2: 60 },
  { name: "25 Mai", value: 28, value2: 58 },
  { name: "30 Mai", value: 27, value2: 59 },
]

const barChartData = [
  { name: "Zone Nord", humidity: 75 },
  { name: "Zone Sud", humidity: 68 },
  { name: "Zone Est", humidity: 82 },
  { name: "Zone Ouest", humidity: 65 },
]

export function AreaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={areaChartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#FF8042" />
        <YAxis yAxisId="right" orientation="right" stroke="#0088FE" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="value"
          name="Température (°C)"
          stroke="#FF8042"
          activeDot={{ r: 8 }}
        />
        <Line yAxisId="right" type="monotone" dataKey="value2" name="Humidité (%)" stroke="#0088FE" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={barChartData}
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
  // Simuler une heatmap avec un tableau de div colorés
  const generateHeatmapData = () => {
    const rows = 10
    const cols = 24
    const data = []

    for (let i = 0; i < rows; i++) {
      const row = []
      for (let j = 0; j < cols; j++) {
        // Valeur aléatoire entre 0 et 100
        const value = Math.floor(Math.random() * 100)
        row.push(value)
      }
      data.push(row)
    }

    return data
  }

  const heatmapData = generateHeatmapData()

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full" className="flex flex-col h-full">
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
