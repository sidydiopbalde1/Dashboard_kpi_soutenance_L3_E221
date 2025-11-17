"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"

const errors: Record<string, string> = {
  Configuration: "Il y a un problème avec la configuration du serveur.",
  AccessDenied: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
  Verification: "Le token de vérification a expiré ou a déjà été utilisé.",
  Default: "Une erreur inattendue s'est produite.",
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  const errorMessage = error && errors[error] ? errors[error] : errors.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Erreur d'authentification
          </h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>
              Un problème est survenu lors de l'authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              {errorMessage}
            </Alert>
            
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/signin">
                  Retour à la connexion
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