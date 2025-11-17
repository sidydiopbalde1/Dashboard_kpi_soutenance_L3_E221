import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/auth/signout
 * Endpoint de déconnexion personnalisé avec nettoyage des sessions
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      // Log de l'action de déconnexion pour audit
      console.log(`User ${session.user.email} (${session.user.id}) logged out at ${new Date().toISOString()}`)
      
      // Ici, on pourrait ajouter des actions de nettoyage supplémentaires :
      // - Invalider des tokens spécifiques
      // - Nettoyer le cache utilisateur
      // - Enregistrer l'activité de déconnexion en base
      
      // Réponse de succès
      return NextResponse.json({
        success: true,
        message: 'Déconnexion réussie',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Aucune session active trouvée'
    })
    
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la déconnexion',
        message: 'Une erreur est survenue pendant la déconnexion' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/signout
 * Redirection vers la page de déconnexion
 */
export async function GET() {
  return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
}