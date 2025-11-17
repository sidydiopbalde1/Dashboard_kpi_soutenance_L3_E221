import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role, ROLE_PERMISSIONS, ROLE_HIERARCHY } from "@/types/auth"
import { redirect } from "next/navigation"

// Re-export types for convenience
export type { Role } from "@/types/auth"

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(
  userRole: Role,
  resource: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]
  
  // Super admin a tous les droits
  if (userRole === "SUPER_ADMIN") {
    return true
  }
  
  return permissions.some(permission => {
    // Permission globale
    if (permission.resource === "*" && permission.actions.includes("*")) {
      return true
    }
    
    // Permission sur la ressource spécifique
    if (permission.resource === resource) {
      return permission.actions.includes("*") || permission.actions.includes(action)
    }
    
    return false
  })
}

/**
 * Vérifie si un rôle a un niveau hiérarchique supérieur ou égal à un autre
 */
export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Middleware pour protéger les routes côté serveur
 */
export async function requireAuth(requiredRole?: Role) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  if (requiredRole && !hasRoleLevel(session.user.role, requiredRole)) {
    redirect("/unauthorized")
  }
  
  return session
}

/**
 * Hook pour vérifier les permissions côté serveur
 */
export async function requirePermission(resource: string, action: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  if (!hasPermission(session.user.role, resource, action)) {
    redirect("/unauthorized")
  }
  
  return session
}

/**
 * Utilitaire pour hasher les mots de passe
 */
import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Génère un mot de passe temporaire
 */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Obtient les rôles disponibles selon le rôle de l'utilisateur
 */
export function getAvailableRoles(userRole: Role): Role[] {
  const userLevel = ROLE_HIERARCHY[userRole]
  
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= userLevel)
    .map(([role]) => role as Role)
    .sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a])
}