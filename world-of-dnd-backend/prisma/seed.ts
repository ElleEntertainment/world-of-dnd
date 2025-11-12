import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash della password "admin"
  const hashedPassword = await bcrypt.hash('admin', 10);

  // Crea l'utente admin se non esiste già
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.it' },
    update: {},
    create: {
      email: 'admin@admin.it',
      password: hashedPassword,
      name: 'Administrator',
      isVerified: true, // L'admin è già verificato
      verificationToken: null,
    },
  });

  console.log('Admin user created/updated:', adminUser);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
