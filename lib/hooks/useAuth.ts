"use client"

import { useSession } from "next-auth/react"
import { Role } from "@/types/auth"
import { hasPermission, hasRoleLevel } from "@/lib/auth-utils"

export function useAuth() {
  const { data: session, status } = useSession()
  
  const checkPermission = (resource: string, action: string): boolean => {
    if (!session?.user?.role) return false
    return hasPermission(session.user.role, resource, action)
  }
  
  const checkRole = (requiredRole: Role): boolean => {
    if (!session?.user?.role) return false
    return hasRoleLevel(session.user.role, requiredRole)
  }
  
  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  
  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    checkPermission,
    checkRole,
  }
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return { isLoading: true }
  }
  
  if (!isAuthenticated) {
    throw new Error("Authentication required")
  }
  
  return { isLoading: false }
}