# Système d'Authentification et d'Autorisation Complété

## Vue d'ensemble
Le système d'authentification et d'autorisation a été entièrement complété avec une protection basée sur les rôles pour tous les endpoints de l'API.

## Composants ajoutés

### 1. Middleware d'authentification (`lib/api-middleware.ts`)
- `withAuth()` - Authentification de base
- `withPermission()` - Vérification des permissions sur les ressources
- `withRole()` - Vérification du niveau de rôle minimum
- `withValidation()` - Validation des données d'entrée
- `createAPIHandler()` - Wrapper complet pour les endpoints
- Utilitaires pour réponses standardisées

### 2. Endpoints protégés mis à jour

#### Dashboard
- **GET /api/dashboard/current** - `dashboard:read`

#### Production  
- **GET /api/production/orders** - `production:read`
- **GET /api/downtime** - `production:read`
- **POST /api/downtime** - `production:create`

#### Maintenance
- **GET /api/maintenance** - `maintenance:read`
- **POST /api/maintenance** - `maintenance:create`
- **GET /api/maintenance/[id]** - `maintenance:read`
- **PUT /api/maintenance/[id]** - `maintenance:update`
- **DELETE /api/maintenance/[id]** - `maintenance:delete`

#### Qualité
- **GET /api/quality** - `quality:read`
- **POST /api/quality** - `quality:create`

#### Sécurité
- **GET /api/safety** - `safety:read`
- **POST /api/safety** - `safety:create`
- **PUT /api/safety/[id]** - `safety:update`
- **DELETE /api/safety/[id]** - `safety:delete`

#### Énergie
- **GET /api/energy** - `energy:read`

#### Équipes
- **GET /api/teams** - `teams:read`

#### Utilisateurs (déjà protégé)
- **GET /api/users** - `users:read`
- **POST /api/users** - `users:create`

## Système de permissions par rôle

### SUPER_ADMIN
- Accès complet à toutes les ressources

### ADMIN
- Gestion complète des utilisateurs, dashboard, production, maintenance, qualité, sécurité
- Lecture/mise à jour de l'énergie
- Gestion des équipes et rapports

### MANAGER
- Lecture/mise à jour de la production et maintenance
- Création de contrôles qualité et incidents sécurité
- Lecture de l'énergie et gestion des équipes

### SUPERVISOR
- Lecture/mise à jour de la production
- Création en maintenance, qualité et sécurité
- Lecture de l'énergie et des équipes

### TECHNICIAN
- Lecture de la production
- Mise à jour de la maintenance
- Création de contrôles qualité et incidents sécurité

### OPERATOR
- Lecture de la production et maintenance
- Lecture de la qualité
- Création d'incidents sécurité

### VIEWER
- Lecture uniquement du dashboard, production, qualité, sécurité et énergie

## Fonctionnalités de sécurité

### Authentification
- Validation de session NextAuth obligatoire
- Vérification du statut actif de l'utilisateur
- Informations utilisateur dans le contexte de requête

### Autorisation
- Permissions granulaires par ressource et action
- Hiérarchie des rôles respectée
- Messages d'erreur détaillés avec codes de statut appropriés

### Validation des données
- Validation des paramètres requis
- Vérification de l'existence des ressources avant modification
- Gestion des erreurs avec messages explicites

### Gestion des erreurs
- Réponses standardisées
- Logging des erreurs côté serveur
- Codes de statut HTTP appropriés (401, 403, 404, 500)

## Utilisation

### Protection simple avec authentification
```typescript
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  // Logique de l'endpoint
});
```

### Protection avec permissions
```typescript
export const GET = withPermission('resource', 'action', async (req) => {
  // Logique de l'endpoint
});
```

### Protection complète avec validation
```typescript
export const POST = createAPIHandler({
  resource: 'maintenance',
  action: 'create',
  validationSchema: maintenanceSchema,
  handler: async (req, validatedData) => {
    // Logique de l'endpoint
  }
});
```

## Améliorations apportées

1. **Sécurité renforcée** - Tous les endpoints nécessitent une authentification
2. **Autorisation granulaire** - Permissions basées sur les rôles et actions
3. **Code mainteable** - Middleware réutilisable et fonctions utilitaires
4. **Gestion d'erreurs robuste** - Messages d'erreur clairs et codes de statut appropriés
5. **Validation des données** - Vérification des paramètres d'entrée
6. **Audit trail** - Logging des actions et erreurs

## Tests recommandés

1. Tester l'accès avec différents rôles
2. Vérifier les rejets d'accès non autorisé
3. Valider les messages d'erreur appropriés
4. Tester la création/modification/suppression avec les bonnes permissions
5. Vérifier le comportement avec des sessions expirées

Le système d'authentification est maintenant complet et sécurisé pour la production.