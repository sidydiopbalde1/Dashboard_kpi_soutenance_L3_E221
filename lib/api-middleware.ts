import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission, hasRoleLevel, Role } from '@/lib/auth-utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    role: Role
    department?: string
    email: string
    name: string
  }
}

/**
 * Middleware pour authentifier les requêtes API
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'Vous devez être connecté pour accéder à cette ressource' },
        { status: 401 }
      )
    }

    // Ajouter les informations utilisateur à la requête
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = {
      id: session.user.id,
      role: session.user.role as Role,
      department: session.user.department,
      email: session.user.email!,
      name: session.user.name!,
    }

    try {
      return await handler(authenticatedReq)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Internal server error', message: 'Une erreur interne est survenue' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware pour vérifier les permissions sur une ressource
 */
export function withPermission(
  resource: string,
  action: string,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasPermission(req.user.role, resource, action)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions', 
          message: `Vous n'avez pas les permissions pour ${action} sur ${resource}`,
          required: `${action}:${resource}`,
          userRole: req.user.role
        },
        { status: 403 }
      )
    }

    return handler(req)
  })
}

/**
 * Middleware pour vérifier un rôle minimum requis
 */
export function withRole(
  requiredRole: Role,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasRoleLevel(req.user.role, requiredRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient role level', 
          message: `Cette action nécessite le rôle ${requiredRole} minimum`,
          required: requiredRole,
          userRole: req.user.role
        },
        { status: 403 }
      )
    }

    return handler(req)
  })
}

/**
 * Utilitaire pour créer une réponse d'erreur standardisée
 */
export function createErrorResponse(
  error: string,
  message?: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      error,
      message: message || 'Une erreur est survenue',
      timestamp: new Date().toISOString(),
      ...(details && { details })
    },
    { status }
  )
}

/**
 * Utilitaire pour créer une réponse de succès standardisée
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

/**
 * Middleware pour valider les paramètres de requête
 */
export function withValidation<T>(
  schema: {
    parse: (data: any) => T
  },
  handler: (req: AuthenticatedRequest, validatedData: T) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      let data: any
      
      if (req.method === 'GET') {
        // Pour GET, parser les query parameters
        const url = new URL(req.url || '', `http://${req.headers.get('host') || 'localhost'}`)
        data = Object.fromEntries(url.searchParams.entries())
      } else {
        // Pour POST, PUT, PATCH, parser le body JSON
        try {
          data = await req.json()
        } catch {
          data = {}
        }
      }
      
      const validatedData = schema.parse(data)
      return handler(req, validatedData)
    } catch (error: any) {
      return createErrorResponse(
        'Validation error',
        'Données de requête invalides',
        400,
        error.issues || error.message
      )
    }
  })
}

/**
 * Wrapper complet pour les endpoints API avec auth, permissions et validation
 */
export function createAPIHandler({
  resource,
  action,
  requiredRole,
  validationSchema,
  handler
}: {
  resource?: string
  action?: string
  requiredRole?: Role
  validationSchema?: { parse: (data: any) => any }
  handler: (req: AuthenticatedRequest, validatedData?: any) => Promise<NextResponse>
}) {
  // Fonction de base qui gère la validation et appelle le handler
  const baseHandler = async (req: AuthenticatedRequest) => {
    if (validationSchema) {
      try {
        let data: any
        
        if (req.method === 'GET') {
          const url = new URL(req.url || '', `http://${req.headers.get('host') || 'localhost'}`)
          data = Object.fromEntries(url.searchParams.entries())
        } else {
          try {
            data = await req.json()
          } catch {
            data = {}
          }
        }
        
        const validatedData = validationSchema.parse(data)
        return handler(req, validatedData)
      } catch (error: any) {
        return createErrorResponse(
          'Validation error',
          'Données de requête invalides',
          400,
          error.issues || error.message
        )
      }
    } else {
      return handler(req, undefined)
    }
  }

  // Appliquer l'authentification/autorisation appropriée
  if (resource && action) {
    return withPermission(resource, action, baseHandler)
  } else if (requiredRole) {
    return withRole(requiredRole, baseHandler)
  } else {
    return withAuth(baseHandler)
  }
}