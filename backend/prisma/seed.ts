import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
  });

  const passwordHash = await bcrypt.hash('admin1234', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@llaveros.local' },
    update: {},
    create: { rolId: rolAdmin.id, email: 'admin@llaveros.local', passwordHash },
  });

  console.log('Seed completado: admin@llaveros.local / admin1234');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
