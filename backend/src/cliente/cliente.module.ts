import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClienteController } from './cliente.controller.js';
import { ClienteService } from './cliente.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService],
})
export class ClienteModule {}
