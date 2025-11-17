import { DefaultSession } from "next-auth"

export type Role = 
  | "SUPER_ADMIN"
  | "ADMIN" 
  | "MANAGER"
  | "SUPERVISOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "VIEWER"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      department?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    department?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    department?: string
  }
}

export interface Permission {
  resource: string
  actions: string[]
}

// Définition des permissions par rôle
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    { resource: "*", actions: ["*"] }
  ],
  ADMIN: [
    { resource: "users", actions: ["create", "read", "update", "delete"] },
    { resource: "dashboard", actions: ["read", "update"] },
    { resource: "production", actions: ["read", "update", "create"] },
    { resource: "maintenance", actions: ["read", "update", "create", "delete"] },
    { resource: "quality", actions: ["read", "update", "create"] },
    { resource: "safety", actions: ["read", "update", "create"] },
    { resource: "energy", actions: ["read", "update"] },
    { resource: "teams", actions: ["read", "update", "create"] },
    { resource: "reports", actions: ["read", "create", "export"] },
  ],
  MANAGER: [
    { resource: "dashboard", actions: ["read"] },
    { resource: "production", actions: ["read", "update"] },
    { resource: "maintenance", actions: ["read", "create", "update"] },
    { resource: "quality", actions: ["read", "create"] },
    { resource: "safety", actions: ["read", "create"] },
    { resource: "energy", actions: ["read"] },
    { resource: "teams", actions: ["read", "update"] },
    { resource: "reports", actions: ["read", "create"] },
  ],
  SUPERVISOR: [
    { resource: "dashboard", actions: ["read"] },
    { resource: "production", actions: ["read", "update"] },
    { resource: "maintenance", actions: ["read", "create"] },
    { resource: "quality", actions: ["read", "create"] },
    { resource: "safety", actions: ["read", "create"] },
    { resource: "energy", actions: ["read"] },
    { resource: "teams", actions: ["read"] },
  ],
  TECHNICIAN: [
    { resource: "dashboard", actions: ["read"] },
    { resource: "production", actions: ["read"] },
    { resource: "maintenance", actions: ["read", "update"] },
    { resource: "quality", actions: ["read", "create"] },
    { resource: "safety", actions: ["read", "create"] },
    { resource: "energy", actions: ["read"] },
  ],
  OPERATOR: [
    { resource: "dashboard", actions: ["read"] },
    { resource: "production", actions: ["read"] },
    { resource: "maintenance", actions: ["read"] },
    { resource: "quality", actions: ["read"] },
    { resource: "safety", actions: ["read", "create"] },
  ],
  VIEWER: [
    { resource: "dashboard", actions: ["read"] },
    { resource: "production", actions: ["read"] },
    { resource: "quality", actions: ["read"] },
    { resource: "safety", actions: ["read"] },
    { resource: "energy", actions: ["read"] },
  ]
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 7,
  ADMIN: 6,
  MANAGER: 5,
  SUPERVISOR: 4,
  TECHNICIAN: 3,
  OPERATOR: 2,
  VIEWER: 1,
}