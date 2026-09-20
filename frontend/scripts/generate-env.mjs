#!/usr/bin/env node
// Genera src/environments/environment.ts a partir de frontend/.env.
// Se ejecuta automáticamente antes de `npm start` y `npm run build` (hooks
// "pre" de npm) para que el despliegue solo requiera editar el .env.
import { config } from 'dotenv';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const outputPath = resolve(__dirname, '../src/environments/environment.ts');

if (!existsSync(envPath)) {
  console.error(
    '\n[generate-env] No se encontró frontend/.env.\n' +
      '  Copia frontend/.env.example a frontend/.env y completa los valores antes de continuar.\n',
  );
  process.exit(1);
}

config({ path: envPath, quiet: true });

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
const production = process.env.NODE_ENV === 'production';

const content = `// Archivo GENERADO automáticamente por scripts/generate-env.mjs a partir de .env.
// No edites este archivo a mano — tus cambios se perderán en el próximo build.
// Para cambiar estos valores, edita frontend/.env.
export const environment = {
  production: ${production},
  apiBaseUrl: '${apiBaseUrl}',
};
`;

writeFileSync(outputPath, content);
console.log(`[generate-env] environment.ts generado (apiBaseUrl=${apiBaseUrl}, production=${production})`);
