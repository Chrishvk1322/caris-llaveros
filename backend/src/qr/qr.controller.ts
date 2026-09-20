import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GuardarQrDto } from './dto/guardar-qr.dto.js';
import { QrService } from './qr.service.js';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  obtener() {
    return this.qrService.obtener();
  }

  @Put()
  guardar(@Body() dto: GuardarQrDto) {
    return this.qrService.guardar(dto.url);
  }
}
