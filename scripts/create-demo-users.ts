import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDemoUsers() {
  console.log('🔧 Création des utilisateurs de démonstration...')

  const demoUsers = [
    {
      name: "Super Administrator",
      email: "superadmin@company.com",
      password: "superadmin123",
      role: "SUPER_ADMIN",
      department: "IT"
    },
    {
      name: "Administrateur Système",
      email: "admin@company.com",
      password: "admin123",
      role: "ADMIN",
      department: "IT"
    },
    {
      name: "Manager Production",
      email: "manager@company.com",
      password: "manager123",
      role: "MANAGER",
      department: "Production"
    },
    {
      name: "Superviseur Qualité",
      email: "supervisor@company.com",
      password: "supervisor123",
      role: "SUPERVISOR",
      department: "Qualité"
    },
    {
      name: "Technicien Maintenance",
      email: "technician@company.com",
      password: "technician123",
      role: "TECHNICIAN",
      department: "Maintenance"
    },
    {
      name: "Opérateur Machine",
      email: "operator@company.com",
      password: "operator123",
      role: "OPERATOR",
      department: "Production"
    },
    {
      name: "Observateur Externe",
      email: "viewer@company.com",
      password: "viewer123",
      role: "VIEWER",
      department: "Externe"
    }
  ]

  for (const userData of demoUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`⚠️  L'utilisateur ${userData.email} existe déjà`)
        continue
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role as any,
          department: userData.department,
          isActive: true
        }
      })

      console.log(`✅ Utilisateur créé : ${user.email} (${user.role})`)
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${userData.email}:`, error)
    }
  }

  console.log('\n📋 Récapitulatif des comptes de démonstration :')
  console.log('┌─────────────────────────┬──────────────────────────┬──────────────────┐')
  console.log('│ Email                   │ Mot de passe             │ Rôle             │')
  console.log('├─────────────────────────┼──────────────────────────┼──────────────────┤')
  
  for (const user of demoUsers) {
    console.log(`│ ${user.email.padEnd(23)} │ ${user.password.padEnd(24)} │ ${user.role.padEnd(16)} │`)
  }
  
  console.log('└─────────────────────────┴──────────────────────────┴──────────────────┘')
}

createDemoUsers()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n🎉 Utilisateurs de démonstration créés avec succès !')
  })
  .catch(async (e) => {
    console.error('❌ Erreur :', e)
    await prisma.$disconnect()
    process.exit(1)
  })