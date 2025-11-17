# Documentation - Système d'Authentification

## Vue d'ensemble

Le système d'authentification implémente une solution complète avec NextAuth.js, gestion des rôles hiérarchiques et contrôle d'accès granulaire.

## Architecture

### Composants principaux

1. **NextAuth.js** - Gestion des sessions et authentification
2. **Prisma** - Modèles de données pour utilisateurs et sessions
3. **bcryptjs** - Hashage sécurisé des mots de passe
4. **Système de rôles** - 7 niveaux hiérarchiques
5. **Middleware de permissions** - Contrôle d'accès par ressource/action

### Structure des fichiers

```
lib/
├── auth.ts                 # Configuration NextAuth
├── auth-utils.ts          # Utilitaires d'authentification
└── hooks/
    └── useAuth.ts         # Hooks côté client

components/
├── auth/
│   ├── ProtectedRoute.tsx # Protection des routes
│   ├── RoleGuard.tsx     # Garde conditionnel
│   └── UserProfile.tsx   # Profil utilisateur
└── providers/
    └── AuthProvider.tsx  # Provider NextAuth

app/
├── api/
│   ├── auth/[...nextauth]/ # API NextAuth
│   └── users/             # API gestion utilisateurs
└── auth/
    ├── signin/            # Page de connexion
    ├── error/             # Page d'erreur
    └── unauthorized/      # Page non autorisé

types/
└── auth.ts               # Types et permissions
```

## Système de rôles

### Hiérarchie des rôles

1. **SUPER_ADMIN** (Niveau 7) - Accès total au système
2. **ADMIN** (Niveau 6) - Administration générale
3. **MANAGER** (Niveau 5) - Management d'équipe
4. **SUPERVISOR** (Niveau 4) - Supervision de zone
5. **TECHNICIAN** (Niveau 3) - Technicien spécialisé
6. **OPERATOR** (Niveau 2) - Opérateur de base
7. **VIEWER** (Niveau 1) - Lecture seule

### Matrice des permissions

| Ressource | SUPER_ADMIN | ADMIN | MANAGER | SUPERVISOR | TECHNICIAN | OPERATOR | VIEWER |
|-----------|-------------|--------|---------|------------|------------|----------|--------|
| users     | CRUD        | CRUD   | -       | -          | -          | -        | -      |
| dashboard | RU          | RU     | R       | R          | R          | R        | R      |
| production| CRUD        | RUC    | RU      | RU         | R          | R        | R      |
| maintenance| CRUD       | CRUD   | RUC     | RC         | RU         | R        | -      |
| quality   | CRUD        | RUC    | RC      | RC         | RC         | R        | R      |
| safety    | CRUD        | RUC    | RC      | RC         | RC         | RC       | R      |
| energy    | RU          | RU     | R       | R          | R          | -        | R      |
| teams     | CRUD        | RUC    | RU      | R          | -          | -        | -      |
| reports   | RCE         | RCE    | RC      | -          | -          | -        | -      |

*Légende: R=Read, U=Update, C=Create, D=Delete, E=Export*

## Utilisation

### 1. Protection de routes

```tsx
// Protection complète d'une page
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>Contenu admin</div>
    </ProtectedRoute>
  )
}

// Protection par permission
<ProtectedRoute 
  requiredPermission={{ resource: 'users', action: 'create' }}
>
  <CreateUserForm />
</ProtectedRoute>
```

### 2. Garde conditionnel

```tsx
// Affichage conditionnel
import { RoleGuard } from '@/components/auth/RoleGuard'

<RoleGuard requiredRole="MANAGER">
  <ManagerOnlyButton />
</RoleGuard>

<RoleGuard 
  requiredPermission={{ resource: 'reports', action: 'export' }}
>
  <ExportButton />
</RoleGuard>
```

### 3. Vérifications côté serveur

```tsx
// Dans un API route
import { requireAuth, requirePermission } from '@/lib/auth-utils'

export async function POST() {
  const session = await requirePermission('users', 'create')
  // Logic here
}

// Vérification manuelle
import { hasPermission } from '@/lib/auth-utils'

const canEdit = hasPermission(user.role, 'production', 'update')
```

### 4. Hooks côté client

```tsx
'use client'
import { useAuth } from '@/lib/hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, checkPermission, checkRole } = useAuth()
  
  const canCreateUser = checkPermission('users', 'create')
  const isManager = checkRole('MANAGER')
  
  return (
    <div>
      {canCreateUser && <CreateButton />}
      {isManager && <ManagerSection />}
    </div>
  )
}
```

## Configuration

### Variables d'environnement

```env
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Migration de la base

```bash
# Générer le client Prisma
npm run db:generate

# Créer et appliquer la migration
npm run db:migrate

# Créer les utilisateurs de démonstration
npm run auth:create-users
```

## Comptes de démonstration

| Email | Mot de passe | Rôle | Département |
|-------|--------------|------|-------------|
| superadmin@company.com | superadmin123 | SUPER_ADMIN | IT |
| admin@company.com | admin123 | ADMIN | IT |
| manager@company.com | manager123 | MANAGER | Production |
| supervisor@company.com | supervisor123 | SUPERVISOR | Qualité |
| technician@company.com | technician123 | TECHNICIAN | Maintenance |
| operator@company.com | operator123 | OPERATOR | Production |
| viewer@company.com | viewer123 | VIEWER | Externe |

## Sécurité

### Bonnes pratiques implémentées

1. **Hashage des mots de passe** avec bcrypt (12 rounds)
2. **Sessions JWT** sécurisées avec NextAuth
3. **Validation côté serveur** pour toutes les API
4. **Principe du moindre privilège** dans les permissions
5. **Protection CSRF** intégrée à NextAuth
6. **Validation des entrées** dans les API routes

### À ajouter en production

1. **Rate limiting** sur les tentatives de connexion
2. **2FA (Two-Factor Authentication)**
3. **Audit logs** des actions sensibles
4. **Rotation des secrets** NextAuth
5. **Monitoring** des connexions suspectes

## API Endpoints

### Authentification
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signout` - Déconnexion
- `GET /api/auth/session` - Session actuelle

### Gestion des utilisateurs
- `GET /api/users` - Liste des utilisateurs (Admin+)
- `POST /api/users` - Créer un utilisateur (Admin+)
- `PUT /api/users/[id]` - Modifier un utilisateur (Admin+)
- `DELETE /api/users/[id]` - Supprimer un utilisateur (Admin+)

## Maintenance

### Commandes utiles

```bash
# Créer de nouveaux utilisateurs
npm run auth:create-users

# Réinitialiser les permissions d'un utilisateur
npm run auth:reset-permissions [email]

# Audit des connexions
npm run auth:audit-logs

# Backup des utilisateurs
npm run auth:backup-users
```

### Logs et monitoring

- Sessions actives dans la table `Session`
- Tentatives de connexion dans les logs NextAuth
- Erreurs d'autorisation dans les logs d'application

## Troubleshooting

### Problèmes courants

1. **"Non autorisé"** 
   - Vérifier que l'utilisateur est connecté
   - Vérifier les permissions du rôle

2. **"Session expirée"**
   - Reconnecter l'utilisateur
   - Vérifier la configuration NEXTAUTH_SECRET

3. **"Permissions insuffisantes"**
   - Vérifier le rôle de l'utilisateur
   - Vérifier la matrice des permissions

4. **Erreurs de base de données**
   - Vérifier que les migrations sont appliquées
   - Vérifier la connexion DATABASE_URL