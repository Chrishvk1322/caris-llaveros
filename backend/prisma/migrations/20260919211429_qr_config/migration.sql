-- CreateTable
CREATE TABLE "qr_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_config_pkey" PRIMARY KEY ("id")
);
