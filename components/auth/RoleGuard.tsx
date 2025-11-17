"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Role } from "@/types/auth"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: Role
  requiredPermission?: {
    resource: string
    action: string
  }
  fallback?: React.ReactNode
  showFallback?: boolean
}

/**
 * Composant pour conditionner l'affichage selon les permissions
 * Ne redirige pas, permet juste de cacher/montrer du contenu
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
  showFallback = false
}: RoleGuardProps) {
  const { isAuthenticated, checkRole, checkPermission } = useAuth()

  if (!isAuthenticated) {
    return showFallback ? <>{fallback}</> : null
  }

  // Vérification du rôle requis
  if (requiredRole && !checkRole(requiredRole)) {
    return showFallback ? <>{fallback}</> : null
  }

  // Vérification de la permission requise
  if (requiredPermission && !checkPermission(requiredPermission.resource, requiredPermission.action)) {
    return showFallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}