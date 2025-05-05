import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc } from "firebase/firestore"

// Route pour créer une nouvelle alerte
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Vérifier que les données requises sont présentes
    if (!data.type || !data.message || !data.severity || !data.location || !data.userId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
    }

    // Créer l'alerte dans Firestore
    const alertsRef = collection(db, "alerts")
    const docRef = await addDoc(alertsRef, {
      ...data,
      timestamp: Timestamp.fromDate(new Date()),
      isRead: false,
    })

    return NextResponse.json({
      success: true,
      id: docRef.id,
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'alerte:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'alerte" }, { status: 500 })
  }
}

// Route pour marquer une alerte comme lue
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    // Vérifier que l'ID de l'alerte est présent
    if (!data.id) {
      return NextResponse.json({ error: "ID d'alerte manquant" }, { status: 400 })
    }

    // Vérifier que l'alerte existe
    const alertRef = doc(db, "alerts", data.id)
    const alertDoc = await getDoc(alertRef)

    if (!alertDoc.exists()) {
      return NextResponse.json({ error: "Alerte non trouvée" }, { status: 404 })
    }

    // Marquer l'alerte comme lue
    await updateDoc(alertRef, {
      isRead: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'alerte:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'alerte" }, { status: 500 })
  }
}
