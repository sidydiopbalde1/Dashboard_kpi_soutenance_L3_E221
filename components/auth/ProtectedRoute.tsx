"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Role } from "@/types/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
  requiredPermission?: {
    resource: string
    action: string
  }
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkRole, checkPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  // Vérification du rôle requis
  if (requiredRole && !checkRole(requiredRole)) {
    router.push("/unauthorized")
    return fallback || null
  }

  // Vérification de la permission requise
  if (requiredPermission && !checkPermission(requiredPermission.resource, requiredPermission.action)) {
    router.push("/unauthorized")
    return fallback || null
  }

  return <>{children}</>
}