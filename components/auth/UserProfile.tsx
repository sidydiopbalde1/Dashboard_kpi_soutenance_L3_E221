"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutDialog, useLogoutDialog } from "@/components/auth/LogoutDialog"
import { User, Settings, LogOut, Shield, AlertTriangle } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  SUPERVISOR: "Superviseur", 
  TECHNICIAN: "Technicien",
  OPERATOR: "Opérateur",
  VIEWER: "Observateur"
}

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "destructive", 
  MANAGER: "default",
  SUPERVISOR: "default",
  TECHNICIAN: "secondary",
  OPERATOR: "secondary",
  VIEWER: "outline"
}

export function UserProfile() {
  const { user, isAuthenticated } = useAuth()
  const logoutDialog = useLogoutDialog()

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm">
        <User className="h-4 w-4 mr-2" />
        Se connecter
      </Button>
    )
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() || '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || "Utilisateur"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={ROLE_COLORS[user.role]} className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
              {user.department && (
                <Badge variant="outline" className="text-xs">
                  {user.department}
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logoutDialog.showNormalLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={logoutDialog.showEmergencyLogout} 
          className="text-red-800 bg-red-50 hover:bg-red-100"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          <span>Déconnexion d'urgence</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      {/* Dialog de confirmation de déconnexion */}
      <LogoutDialog
        open={logoutDialog.isOpen}
        onOpenChange={logoutDialog.hideDialog}
        variant={logoutDialog.variant}
      />
    </DropdownMenu>
  )
}