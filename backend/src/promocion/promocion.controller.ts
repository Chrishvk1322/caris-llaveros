import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CambiarEstadoDto } from '../common/dto/cambiar-estado.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { CreatePromocionDto } from './dto/create-promocion.dto.js';
import { UpdatePromocionDto } from './dto/update-promocion.dto.js';
import { PromocionService } from './promocion.service.js';

@Controller('promociones')
@UseGuards(JwtAuthGuard)
export class PromocionController {
  constructor(private readonly promocionService: PromocionService) {}

  @Post()
  create(@Body() dto: CreatePromocionDto) {
    return this.promocionService.create(dto);
  }

  @Get()
  listar(@Query() query: PaginationQueryDto) {
    return this.promocionService.listar(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocionService.findOne(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdatePromocionDto) {
    return this.promocionService.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoDto) {
    return this.promocionService.cambiarEstado(id, dto);
  }
}
