import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { VentaController } from './venta.controller.js';
import { VentaService } from './venta.service.js';

@Module({
  imports: [AuthModule],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}
