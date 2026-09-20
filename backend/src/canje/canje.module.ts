import { Module } from '@nestjs/common';
import { CanjeController } from './canje.controller.js';
import { CanjeService } from './canje.service.js';

@Module({
  controllers: [CanjeController],
  providers: [CanjeService],
})
export class CanjeModule {}
