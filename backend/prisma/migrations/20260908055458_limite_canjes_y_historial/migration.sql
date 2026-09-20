-- AlterTable: límite de canjes por promoción
ALTER TABLE "promocion" ADD COLUMN "limite_canjes" INTEGER NOT NULL DEFAULT 1;

-- AlterTable: contador de canjes realizados (se agrega antes de tocar estado_canje/fecha_canje)
ALTER TABLE "venta_llavero" ADD COLUMN "canjes_realizados" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: historial de canjes (uno por cada vez que se aplica el PIN)
CREATE TABLE "canje" (
    "id" TEXT NOT NULL,
    "venta_llavero_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canje_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "canje" ADD CONSTRAINT "canje_venta_llavero_id_fkey" FOREIGN KEY ("venta_llavero_id") REFERENCES "venta_llavero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: preserva el historial existente antes de borrar las columnas viejas
UPDATE "venta_llavero" SET "canjes_realizados" = 1 WHERE "estado_canje" = 'CANJEADO';

INSERT INTO "canje" ("id", "venta_llavero_id", "fecha")
SELECT gen_random_uuid()::text, "id", COALESCE("fecha_canje", "created_at")
FROM "venta_llavero"
WHERE "estado_canje" = 'CANJEADO';

-- AlterTable: ya no se necesitan, reemplazadas por canjes_realizados/canje
ALTER TABLE "venta_llavero" DROP COLUMN "estado_canje";
ALTER TABLE "venta_llavero" DROP COLUMN "fecha_canje";

-- DropEnum
DROP TYPE "EstadoCanje";
