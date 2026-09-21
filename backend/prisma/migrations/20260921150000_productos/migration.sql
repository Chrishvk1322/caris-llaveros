-- AlterTable
ALTER TABLE "venta_llavero" ADD COLUMN     "producto_id" TEXT;

-- CreateTable
CREATE TABLE "producto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "foto" BYTEA,
    "foto_mime" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producto_codigo_key" ON "producto"("codigo");

-- AddForeignKey
ALTER TABLE "venta_llavero" ADD CONSTRAINT "venta_llavero_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
