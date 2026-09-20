import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { RealizarVentaDto } from './dto/realizar-venta.dto.js';
import { VentaService } from './venta.service.js';

@Controller('ventas')
@UseGuards(JwtAuthGuard)
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  realizarVenta(@Body() dto: RealizarVentaDto) {
    return this.ventaService.realizarVenta(dto);
  }

  @Get()
  listar(@Query() query: PaginationQueryDto) {
    return this.ventaService.listar(query);
  }

  @Get(':id')
  obtenerDetalle(@Param('id') id: string) {
    return this.ventaService.obtenerDetalle(id);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') id: string) {
    return this.ventaService.reactivar(id);
  }
}
