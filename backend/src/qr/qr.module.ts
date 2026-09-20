import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { QrController } from './qr.controller.js';
import { QrService } from './qr.service.js';

@Module({
  imports: [AuthModule],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}
