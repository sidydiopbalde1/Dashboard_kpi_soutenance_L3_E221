"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"

export default function Unauthorized() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Accès non autorisé
          </h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Permissions insuffisantes</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <div>
                <strong>Utilisateur connecté :</strong> {user?.name || user?.email}
              </div>
              <div>
                <strong>Rôle actuel :</strong> {user?.role}
              </div>
              {user?.department && (
                <div>
                  <strong>Département :</strong> {user.department}
                </div>
              )}
            </Alert>
            
            <div className="text-sm text-gray-600">
              <p>
                Si vous pensez que cela est une erreur, contactez votre administrateur 
                système pour obtenir les permissions appropriées.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/dashboard">
                  Retour au dashboard
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}