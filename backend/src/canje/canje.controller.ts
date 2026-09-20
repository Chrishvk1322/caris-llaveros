import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { NoCacheInterceptor } from '../common/interceptors/no-cache.interceptor.js';
import { CanjeService } from './canje.service.js';
import { AplicarPinDto } from './dto/aplicar-pin.dto.js';
import { BuscarPorDniDto } from './dto/buscar-por-dni.dto.js';

@Controller('canje')
@UseInterceptors(NoCacheInterceptor)
export class CanjeController {
  constructor(private readonly canjeService: CanjeService) {}

  // Debe ir antes de ':token' — si no, Nest interpreta "buscar" como un tokenUrl.
  @Get('buscar')
  buscarPorDni(@Query() query: BuscarPorDniDto) {
    return this.canjeService.buscarPorDni(query.dni);
  }

  @Get(':token')
  resolverEstado(@Param('token') token: string) {
    return this.canjeService.resolverEstado(token);
  }

  @Post(':token/aplicar')
  aplicarPin(@Param('token') token: string, @Body() dto: AplicarPinDto) {
    return this.canjeService.aplicarPin(token, dto);
  }
}
