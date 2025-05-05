import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

/**
 * Convertit un timestamp Firestore en objet Date JavaScript
 */
export function convertTimestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null

  try {
    // Si c'est un timestamp Firestore avec seconds
    if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000)
    }

    // Si c'est déjà une date JavaScript
    if (timestamp instanceof Date) {
      return timestamp
    }

    // Si c'est un nombre (timestamp en millisecondes)
    if (typeof timestamp === "number") {
      return new Date(timestamp)
    }

    // Si c'est une chaîne de caractères
    if (typeof timestamp === "string") {
      return new Date(timestamp)
    }

    return null
  } catch (error) {
    console.error("Erreur lors de la conversion du timestamp:", error)
    return null
  }
}

/**
 * Formate un timestamp en date relative (il y a X minutes, etc.)
 */
export function formatRelativeTime(timestamp: any): string {
  const date = convertTimestampToDate(timestamp)
  if (!date) return "Date inconnue"

  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr })
  } catch (error) {
    console.error("Erreur lors du formatage de la date relative:", error)
    return "Date inconnue"
  }
}

/**
 * Formate un timestamp en date complète (JJ MMM à HH:MM)
 */
export function formatFullDate(timestamp: any): string {
  const date = convertTimestampToDate(timestamp)
  if (!date) return "Date inconnue"

  try {
    return format(date, "dd MMM à HH:mm", { locale: fr })
  } catch (error) {
    console.error("Erreur lors du formatage de la date complète:", error)
    return "Date inconnue"
  }
}

/**
 * Formate un timestamp en date courte (JJ/MM/YYYY)
 */
export function formatShortDate(timestamp: any): string {
  const date = convertTimestampToDate(timestamp)
  if (!date) return "Date inconnue"

  try {
    return format(date, "dd/MM/yyyy", { locale: fr })
  } catch (error) {
    console.error("Erreur lors du formatage de la date courte:", error)
    return "Date inconnue"
  }
}
