import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Uso: pnpm exec tsx prisma/create-admin.ts <email> <password>');
    process.exitCode = 1;
    return;
  }

  if (password.length < 6) {
    console.error('La contraseña debe tener al menos 6 caracteres.');
    process.exitCode = 1;
    return;
  }

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
  });

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuario.upsert({
    where: { email },
    update: { passwordHash },
    create: { rolId: rolAdmin.id, email, passwordHash },
  });

  console.log(`Usuario admin creado/actualizado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
