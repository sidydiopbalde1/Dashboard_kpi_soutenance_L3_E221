import { signOut } from 'next-auth/react'

/**
 * Options pour la déconnexion
 */
export interface LogoutOptions {
  /** URL de redirection après déconnexion */
  callbackUrl?: string
  /** Effectuer la redirection automatiquement */
  redirect?: boolean
  /** Afficher une confirmation avant déconnexion */
  confirm?: boolean
  /** Message de confirmation personnalisé */
  confirmMessage?: string
}

/**
 * Utilitaire pour gérer la déconnexion avec nettoyage
 */
export async function logout(options: LogoutOptions = {}) {
  const {
    callbackUrl = '/auth/signin',
    redirect = true,
    confirm = false,
    confirmMessage = 'Êtes-vous sûr de vouloir vous déconnecter ?'
  } = options

  // Demander confirmation si nécessaire
  if (confirm && !window.confirm(confirmMessage)) {
    return false
  }

  try {
    // Nettoyage côté client
    localStorage.removeItem('user-preferences')
    sessionStorage.clear()

    // Appel à l'endpoint de déconnexion personnalisé
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.warn('Erreur lors de l\'appel de déconnexion personnalisé:', error)
    }

    // Déconnexion NextAuth
    await signOut({
      callbackUrl,
      redirect
    })

    return true
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return false
  }
}

/**
 * Déconnexion rapide sans confirmation
 */
export const quickLogout = () => logout({ confirm: false })

/**
 * Déconnexion avec confirmation
 */
export const confirmLogout = () => logout({ 
  confirm: true,
  confirmMessage: 'Voulez-vous vraiment vous déconnecter de votre session ?' 
})

/**
 * Déconnexion d'urgence (en cas de problème de sécurité)
 */
export const emergencyLogout = async () => {
  try {
    // Nettoyage immédiat de toutes les données locales
    localStorage.clear()
    sessionStorage.clear()
    
    // Supprimer les cookies manuellement si nécessaire
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })

    // Déconnexion NextAuth
    await signOut({
      callbackUrl: '/auth/signin?error=emergency',
      redirect: true
    })
  } catch (error) {
    console.error('Erreur lors de la déconnexion d\'urgence:', error)
    // Redirection forcée en cas d'échec
    window.location.href = '/auth/signin?error=emergency'
  }
}

/**
 * Vérifier si une déconnexion est en cours
 */
export const isLoggingOut = (): boolean => {
  return sessionStorage.getItem('logout-in-progress') === 'true'
}

/**
 * Marquer le début d'une déconnexion
 */
export const setLoggingOut = (value: boolean) => {
  if (value) {
    sessionStorage.setItem('logout-in-progress', 'true')
  } else {
    sessionStorage.removeItem('logout-in-progress')
  }
}

/**
 * Hook pour gérer l'état de déconnexion
 */
export const useLogout = () => {
  const handleLogout = async (options?: LogoutOptions) => {
    setLoggingOut(true)
    try {
      const success = await logout(options)
      if (!success) {
        setLoggingOut(false)
      }
      return success
    } catch (error) {
      setLoggingOut(false)
      throw error
    }
  }

  return {
    logout: handleLogout,
    quickLogout: () => handleLogout({ confirm: false }),
    confirmLogout: () => handleLogout({ confirm: true }),
    emergencyLogout,
    isLoggingOut: isLoggingOut()
  }
}