"use client"

import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Loader2, LogOut, CheckCircle, AlertCircle } from "lucide-react"

export default function SignOut() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    setStatus('processing')
    setMessage('Déconnexion en cours...')

    try {
      // Appel à l'endpoint de déconnexion personnalisé
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Déconnexion réussie. Redirection...')
        
        // Déconnexion NextAuth
        await signOut({
          callbackUrl: '/auth/signin',
          redirect: true
        })
      } else {
        throw new Error('Erreur lors de la déconnexion')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erreur lors de la déconnexion. Veuillez réessayer.')
      console.error('Erreur de déconnexion:', error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const StatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <LogOut className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Déconnexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Confirmer la déconnexion de votre session
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <StatusIcon />
            </div>
            <CardTitle>
              {status === 'idle' && 'Confirmer la déconnexion'}
              {status === 'processing' && 'Déconnexion en cours'}
              {status === 'success' && 'Déconnexion réussie'}
              {status === 'error' && 'Erreur de déconnexion'}
            </CardTitle>
            <CardDescription>
              {status === 'idle' && session?.user?.email && (
                <>Vous êtes connecté en tant que <strong>{session.user.email}</strong></>
              )}
              {status !== 'idle' && message}
            </CardDescription>
          </CardHeader>
          
          {status !== 'success' && (
            <CardContent>
              {status === 'error' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="ml-2">{message}</span>
                </Alert>
              )}
              
              <div className="space-y-4">
                {status === 'idle' && (
                  <>
                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Confirmer la déconnexion
                    </Button>
                    
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full"
                    >
                      Annuler
                    </Button>
                  </>
                )}
                
                {status === 'processing' && (
                  <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Déconnexion...
                  </Button>
                )}
                
                {status === 'error' && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      className="w-full"
                    >
                      Réessayer
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full"
                    >
                      Retour
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
        
        {status === 'idle' && (
          <div className="text-center text-sm text-gray-600">
            <p>Vous serez redirigé vers la page de connexion après déconnexion.</p>
          </div>
        )}
      </div>
    </div>
  )
}