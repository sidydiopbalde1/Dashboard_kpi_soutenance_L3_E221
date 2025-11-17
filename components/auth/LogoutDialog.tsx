"use client"

import { useState } from "react"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { logout } from "@/lib/logout-utils"

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: () => void
  title?: string
  description?: string
  variant?: 'normal' | 'emergency'
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  variant = 'normal'
}: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user } = useAuth()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      await logout({
        callbackUrl: variant === 'emergency' 
          ? '/auth/signin?error=emergency' 
          : '/auth/signin',
        redirect: true
      })
      
      onConfirm?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      setIsLoggingOut(false)
    }
  }

  const getTitle = () => {
    if (title) return title
    return variant === 'emergency' 
      ? 'Déconnexion d\'urgence' 
      : 'Confirmer la déconnexion'
  }

  const getDescription = () => {
    if (description) return description
    
    const userInfo = user?.email ? ` (${user.email})` : ''
    
    if (variant === 'emergency') {
      return `Une déconnexion d'urgence va être effectuée. Toutes vos données locales seront supprimées et vous serez redirigé vers la page de connexion.`
    }
    
    return `Voulez-vous vraiment vous déconnecter de votre session${userInfo} ? Vous devrez vous reconnecter pour accéder au système.`
  }

  const getIcon = () => {
    if (variant === 'emergency') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
    return <LogOut className="h-5 w-5 text-gray-500" />
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isLoggingOut}
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </AlertDialogCancel>
          
          <AlertDialogAction
            disabled={isLoggingOut}
            onClick={handleLogout}
            className={variant === 'emergency' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Déconnexion...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                {variant === 'emergency' ? 'Déconnexion d\'urgence' : 'Se déconnecter'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook pour utiliser le dialog de déconnexion
export function useLogoutDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [variant, setVariant] = useState<'normal' | 'emergency'>('normal')

  const showDialog = (type: 'normal' | 'emergency' = 'normal') => {
    setVariant(type)
    setIsOpen(true)
  }

  const hideDialog = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    variant,
    showDialog,
    hideDialog,
    showNormalLogout: () => showDialog('normal'),
    showEmergencyLogout: () => showDialog('emergency')
  }
}