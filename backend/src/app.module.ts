import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { CanjeModule } from './canje/canje.module.js';
import { ClienteModule } from './cliente/cliente.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QrModule } from './qr/qr.module.js';
import { PromocionModule } from './promocion/promocion.module.js';
import { TiendaModule } from './tienda/tienda.module.js';
import { VentaModule } from './venta/venta.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    TiendaModule,
    PromocionModule,
    ClienteModule,
    VentaModule,
    CanjeModule,
    QrModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
