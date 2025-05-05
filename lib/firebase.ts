import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  orderBy,
  limit,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpLNyinszzPomK8rcN2QzlynxSrup-2N0",
  authDomain: "agrilink-b3636.firebaseapp.com",
  projectId: "agrilink-b3636",
  storageBucket: "agrilink-b3636.firebasestorage.app",
  messagingSenderId: "973371643773",
  appId: "1:973371643773:web:6f1ea4031788fdae19de14",
}

// Initialisation de Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }

// Types
export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  email: string
  role: "farmer" | "researcher"
  createdAt: Date
  updatedAt: Date
  settings?: any
  additionalInfo?: any
}

export interface SensorData {
  id?: string
  sensorId: string
  type: "humidity" | "temperature" | "water"
  value: number
  unit: string
  location: string
  timestamp: Date
  userId: string
}

export interface Alert {
  id?: string
  type: "humidity" | "temperature" | "water"
  message: string
  severity: "low" | "medium" | "high"
  location: string
  timestamp: Date
  isRead: boolean
  userId: string
}

// Services d'authentification
export const authService = {
  // Inscription d'un nouvel utilisateur
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "farmer" | "researcher",
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Mise à jour du profil utilisateur
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      })

      // Création du document utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        firstName,
        lastName,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "users", user.uid), userProfile)

      return userProfile
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      throw error
    }
  },

  // Connexion d'un utilisateur
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      throw error
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      throw error
    }
  },

  // Récupération du profil utilisateur
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile
      }

      return null
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      throw error
    }
  },

  // Mise à jour du profil utilisateur
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, "users", uid)
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      throw error
    }
  },
}

// Services de données des capteurs
export const sensorService = {
  // Ajouter une nouvelle donnée de capteur
  async addSensorData(data: Omit<SensorData, "id">): Promise<string> {
    try {
      const sensorDataRef = collection(db, "sensorData")
      const docRef = await addDoc(sensorDataRef, {
        ...data,
        timestamp: Timestamp.fromDate(data.timestamp),
      })
      return docRef.id
    } catch (error) {
      console.error("Erreur lors de l'ajout de données de capteur:", error)
      throw error
    }
  },

  // Récupérer les données des capteurs pour un utilisateur
  async getSensorDataByUser(
    userId: string,
    type?: "humidity" | "temperature" | "water",
    location?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SensorData[]> {
    try {
      let q = query(collection(db, "sensorData"), where("userId", "==", userId))

      if (type) {
        q = query(q, where("type", "==", type))
      }

      if (location) {
        q = query(q, where("location", "==", location))
      }

      const querySnapshot = await getDocs(q)
      const sensorData: SensorData[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        let timestamp: Date

        // Convertir le timestamp Firestore en Date
        if (data.timestamp && typeof data.timestamp === "object" && data.timestamp.seconds) {
          timestamp = new Date(data.timestamp.seconds * 1000)
        } else if (data.timestamp) {
          timestamp = new Date(data.timestamp)
        } else {
          timestamp = new Date()
        }

        sensorData.push({
          id: doc.id,
          ...data,
          timestamp,
        } as SensorData)
      })

      // Filtrage manuel par date si nécessaire
      let filteredData = sensorData
      if (startDate || endDate) {
        filteredData = sensorData.filter((data) => {
          if (startDate && data.timestamp < startDate) return false
          if (endDate && data.timestamp > endDate) return false
          return true
        })
      }

      return filteredData
    } catch (error) {
      console.error("Erreur lors de la récupération des données de capteur:", error)
      throw error
    }
  },

  // Récupérer les dernières données pour chaque type de capteur
  async getLatestSensorData(userId: string): Promise<Record<string, SensorData>> {
    try {
      const sensorTypes = ["humidity", "temperature", "water"]
      const result: Record<string, SensorData> = {}

      for (const type of sensorTypes) {
        const q = query(
          collection(db, "sensorData"),
          where("userId", "==", userId || "demo-user-id"),
          where("type", "==", type),
          orderBy("timestamp", "desc"),
          limit(1),
        )

        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const data = doc.data()
          let timestamp: Date

          // Convertir le timestamp Firestore en Date
          if (data.timestamp && typeof data.timestamp === "object" && data.timestamp.seconds) {
            timestamp = new Date(data.timestamp.seconds * 1000)
          } else if (data.timestamp) {
            timestamp = new Date(data.timestamp)
          } else {
            timestamp = new Date()
          }

          result[type] = {
            id: doc.id,
            ...data,
            timestamp,
          } as SensorData
        }
      }

      return result
    } catch (error) {
      console.error("Erreur lors de la récupération des dernières données de capteur:", error)
      throw error
    }
  },
}

// Services d'alertes
export const alertService = {
  // Ajouter une nouvelle alerte
  async addAlert(alert: Omit<Alert, "id">): Promise<string> {
    try {
      const alertsRef = collection(db, "alerts")
      const docRef = await addDoc(alertsRef, {
        ...alert,
        timestamp: Timestamp.fromDate(alert.timestamp),
      })
      return docRef.id
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une alerte:", error)
      throw error
    }
  },

  // Récupérer les alertes pour un utilisateur
  async getAlertsByUser(userId: string, isRead?: boolean): Promise<Alert[]> {
    try {
      let q = query(collection(db, "alerts"), where("userId", "==", userId))

      if (isRead !== undefined) {
        q = query(q, where("isRead", "==", isRead))
      }

      const querySnapshot = await getDocs(q)
      const alerts: Alert[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        alerts.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp).toDate(),
        } as Alert)
      })

      // Tri par date (plus récent en premier)
      return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error)
      throw error
    }
  },

  // Marquer une alerte comme lue
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, "alerts", alertId)
      await updateDoc(alertRef, {
        isRead: true,
      })
    } catch (error) {
      console.error("Erreur lors du marquage de l'alerte comme lue:", error)
      throw error
    }
  },

  // Créer des alertes de test (pour la démo)
  async createTestAlerts(userId: string): Promise<void> {
    try {
      const alertsRef = collection(db, "alerts")

      // Créer quelques alertes de test
      const testAlerts = [
        {
          type: "temperature",
          message: "Température élevée détectée",
          severity: "high",
          location: "Zone Nord",
          timestamp: new Date(),
          isRead: false,
          userId: userId || "demo-user-id",
        },
        {
          type: "humidity",
          message: "Niveau d'humidité bas",
          severity: "medium",
          location: "Zone Est",
          timestamp: new Date(Date.now() - 3600000), // 1 heure avant
          isRead: false,
          userId: userId || "demo-user-id",
        },
        {
          type: "water",
          message: "Niveau d'eau critique",
          severity: "high",
          location: "Zone Sud",
          timestamp: new Date(Date.now() - 7200000), // 2 heures avant
          isRead: false,
          userId: userId || "demo-user-id",
        },
      ]

      for (const alert of testAlerts) {
        await addDoc(alertsRef, {
          ...alert,
          timestamp: Timestamp.fromDate(alert.timestamp),
        })
      }
    } catch (error) {
      console.error("Erreur lors de la création des alertes de test:", error)
      throw error
    }
  },
}

// Service de stockage
export const storageService = {
  // Télécharger une image
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error)
      throw error
    }
  },
}
