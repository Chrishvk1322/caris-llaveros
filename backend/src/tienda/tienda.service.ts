import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CambiarEstadoDto } from '../common/dto/cambiar-estado.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTiendaDto } from './dto/create-tienda.dto.js';
import { UpdateTiendaDto } from './dto/update-tienda.dto.js';

const SALT_ROUNDS = 10;
const SELECT_PUBLICO = { id: true, nombreComercial: true, estado: true } as const;

@Injectable()
export class TiendaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTiendaDto) {
    const pinCajero = await bcrypt.hash(dto.pin, SALT_ROUNDS);
    return this.prisma.tienda.create({
      data: { nombreComercial: dto.nombreComercial, pinCajero },
      select: SELECT_PUBLICO,
    });
  }

  async listar({ page, limit }: PaginationQueryDto) {
    const [data, total] = await Promise.all([
      this.prisma.tienda.findMany({
        select: SELECT_PUBLICO,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nombreComercial: 'asc' },
      }),
      this.prisma.tienda.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const tienda = await this.prisma.tienda.findUnique({ where: { id }, select: SELECT_PUBLICO });
    if (!tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }
    return tienda;
  }

  async actualizar(id: string, dto: UpdateTiendaDto) {
    await this.findOne(id);
    return this.prisma.tienda.update({
      where: { id },
      data: {
        nombreComercial: dto.nombreComercial,
        pinCajero: dto.pin ? await bcrypt.hash(dto.pin, SALT_ROUNDS) : undefined,
      },
      select: SELECT_PUBLICO,
    });
  }

  async cambiarEstado(id: string, dto: CambiarEstadoDto) {
    await this.findOne(id);
    return this.prisma.tienda.update({
      where: { id },
      data: { estado: dto.estado },
      select: SELECT_PUBLICO,
    });
  }
}
