import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PromocionController } from './promocion.controller.js';
import { PromocionService } from './promocion.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PromocionController],
  providers: [PromocionService],
  exports: [PromocionService],
})
export class PromocionModule {}
