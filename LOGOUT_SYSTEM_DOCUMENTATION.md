# Système de Déconnexion Complet

## Vue d'ensemble
Un système de déconnexion robuste et sécurisé a été implémenté avec plusieurs niveaux de sécurité et options de déconnexion.

## Composants ajoutés

### 1. API Endpoint de déconnexion (`app/api/auth/signout/route.ts`)
- **POST /api/auth/signout** - Endpoint de déconnexion avec audit logging
- **GET /api/auth/signout** - Redirection vers la page de connexion
- Nettoyage des sessions côté serveur
- Logging des actions de déconnexion pour audit

### 2. Page de déconnexion (`app/auth/signout/page.tsx`)
- Interface utilisateur dédiée pour la déconnexion
- États visuels : idle, processing, success, error
- Confirmation utilisateur avant déconnexion
- Gestion d'erreurs avec retry
- Redirection automatique après succès

### 3. Utilitaires de déconnexion (`lib/logout-utils.ts`)
- `logout()` - Fonction principale de déconnexion
- `quickLogout()` - Déconnexion sans confirmation
- `confirmLogout()` - Déconnexion avec confirmation
- `emergencyLogout()` - Déconnexion d'urgence avec nettoyage complet
- `useLogout()` - Hook React pour la gestion d'état

### 4. Dialog de confirmation (`components/auth/LogoutDialog.tsx`)
- Dialog de confirmation avec deux variantes : normale et d'urgence
- Affichage des informations utilisateur
- États de chargement avec indicateurs visuels
- Gestion d'erreurs intégrée
- `useLogoutDialog()` - Hook pour gérer l'état du dialog

### 5. Composant UI Alert Dialog (`components/ui/alert-dialog.tsx`)
- Composants UI Radix pour les dialogs d'alerte
- Styles personnalisés avec Tailwind CSS
- Animations et transitions fluides

## Intégrations

### UserProfile Component (`components/auth/UserProfile.tsx`)
- **Déconnexion normale** - Via le menu dropdown
- **Déconnexion d'urgence** - Option d'urgence dans le menu
- Confirmation via dialog avant déconnexion
- Nettoyage des préférences locales

### Sidebar Component (`components/layout/Sidebar.tsx`)
- Bouton de déconnexion dans le footer
- Intégration du dialog de confirmation
- Style cohérent avec l'interface

## Types de déconnexion

### 1. Déconnexion normale
- Confirmation utilisateur requise
- Nettoyage standard des sessions
- Redirection vers `/auth/signin`
- Préservation des préférences non sensibles

### 2. Déconnexion d'urgence
- Nettoyage complet de toutes les données locales
- Suppression forcée des cookies
- Redirection avec paramètre d'erreur
- Utilisée en cas de compromission de sécurité

### 3. Déconnexion automatique
- Peut être déclenchée par expiration de session
- Nettoyage automatique sans confirmation
- Logging des raisons de déconnexion

## Fonctionnalités de sécurité

### Nettoyage des données
```typescript
// Nettoyage localStorage
localStorage.removeItem('user-preferences')
localStorage.clear() // En mode urgence

// Nettoyage sessionStorage
sessionStorage.clear()

// Suppression cookies (mode urgence)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})
```

### Audit logging
- Enregistrement de toutes les déconnexions
- Horodatage et identification utilisateur
- Distinction entre déconnexion volontaire et forcée

### Gestion d'état
- Prévention des déconnexions multiples simultanées
- État de chargement pour feedback utilisateur
- Gestion d'erreurs avec options de retry

## Utilisation

### Déconnexion simple
```typescript
import { logout } from '@/lib/logout-utils'

// Déconnexion avec confirmation
await logout({ confirm: true })

// Déconnexion sans confirmation
await logout({ confirm: false })
```

### Avec le hook useLogout
```typescript
import { useLogout } from '@/lib/logout-utils'

function MyComponent() {
  const { logout, quickLogout, emergencyLogout } = useLogout()
  
  return (
    <button onClick={quickLogout}>
      Se déconnecter
    </button>
  )
}
```

### Avec le dialog de confirmation
```typescript
import { useLogoutDialog } from '@/components/auth/LogoutDialog'

function MyComponent() {
  const logoutDialog = useLogoutDialog()
  
  return (
    <>
      <button onClick={logoutDialog.showNormalLogout}>
        Déconnexion normale
      </button>
      <button onClick={logoutDialog.showEmergencyLogout}>
        Déconnexion d'urgence
      </button>
      
      <LogoutDialog
        open={logoutDialog.isOpen}
        onOpenChange={logoutDialog.hideDialog}
        variant={logoutDialog.variant}
      />
    </>
  )
}
```

## Points d'accès de déconnexion

1. **Menu utilisateur (UserProfile)** - Dropdown avec options normale/urgence
2. **Sidebar** - Bouton dédié dans le footer
3. **Page dédiée** - `/auth/signout` pour déconnexion guidée
4. **API** - `/api/auth/signout` pour déconnexion programmatique
5. **Urgence** - Via utilitaires pour cas de sécurité

## Configuration et personnalisation

### URLs de redirection
- Déconnexion normale : `/auth/signin`
- Déconnexion d'urgence : `/auth/signin?error=emergency`
- Personnalisable via le paramètre `callbackUrl`

### Messages de confirmation
```typescript
logout({
  confirm: true,
  confirmMessage: 'Message personnalisé de confirmation'
})
```

### Nettoyage personnalisé
```typescript
// Ajouter des actions de nettoyage spécifiques
const customLogout = async () => {
  // Nettoyage personnalisé
  await clearCustomCache()
  
  // Déconnexion standard
  await logout()
}
```

## Tests recommandés

1. **Déconnexion normale** - Vérifier redirection et nettoyage
2. **Déconnexion d'urgence** - Vérifier nettoyage complet
3. **Confirmation** - Tester annulation et confirmation
4. **Gestion d'erreurs** - Simuler échecs de déconnexion
5. **Sessions expirées** - Tester comportement avec session invalide
6. **Multiple tabs** - Vérifier synchronisation entre onglets

Le système de déconnexion est maintenant complet et sécurisé pour la production avec tous les niveaux de protection nécessaires.