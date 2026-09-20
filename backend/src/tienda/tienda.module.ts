import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TiendaController } from './tienda.controller.js';
import { TiendaService } from './tienda.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TiendaController],
  providers: [TiendaService],
  exports: [TiendaService],
})
export class TiendaModule {}
