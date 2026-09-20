-- CreateEnum
CREATE TYPE "EstadoCanje" AS ENUM ('PENDIENTE', 'CANJEADO');

-- CreateTable
CREATE TABLE "rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tienda" (
    "id" TEXT NOT NULL,
    "nombre_comercial" TEXT NOT NULL,
    "pin_cajero" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tienda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocion" (
    "id" TEXT NOT NULL,
    "tienda_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_vencimiento" TIMESTAMP(3),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_llavero" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "promocion_id" TEXT NOT NULL,
    "token_url" TEXT NOT NULL,
    "estado_canje" "EstadoCanje" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_canje" TIMESTAMP(3),

    CONSTRAINT "venta_llavero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "venta_llavero_token_url_key" ON "venta_llavero"("token_url");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion" ADD CONSTRAINT "promocion_tienda_id_fkey" FOREIGN KEY ("tienda_id") REFERENCES "tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_llavero" ADD CONSTRAINT "venta_llavero_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_llavero" ADD CONSTRAINT "venta_llavero_promocion_id_fkey" FOREIGN KEY ("promocion_id") REFERENCES "promocion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
