import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CambiarEstadoDto } from '../common/dto/cambiar-estado.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { CreateTiendaDto } from './dto/create-tienda.dto.js';
import { UpdateTiendaDto } from './dto/update-tienda.dto.js';
import { TiendaService } from './tienda.service.js';

@Controller('tiendas')
@UseGuards(JwtAuthGuard)
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Post()
  create(@Body() dto: CreateTiendaDto) {
    return this.tiendaService.create(dto);
  }

  @Get()
  listar(@Query() query: PaginationQueryDto) {
    return this.tiendaService.listar(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiendaService.findOne(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateTiendaDto) {
    return this.tiendaService.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoDto) {
    return this.tiendaService.cambiarEstado(id, dto);
  }
}
