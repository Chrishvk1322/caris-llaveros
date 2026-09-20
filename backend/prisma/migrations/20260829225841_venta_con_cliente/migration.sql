
-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "dni" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "venta_llavero" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "cliente_dni_key" ON "cliente"("dni");

