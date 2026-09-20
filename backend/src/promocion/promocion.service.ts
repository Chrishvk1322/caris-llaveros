import { Injectable, NotFoundException } from '@nestjs/common';
import { CambiarEstadoDto } from '../common/dto/cambiar-estado.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromocionDto } from './dto/create-promocion.dto.js';
import { UpdatePromocionDto } from './dto/update-promocion.dto.js';

@Injectable()
export class PromocionService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePromocionDto) {
    return this.prisma.promocion.create({
      data: {
        tiendaId: dto.tiendaId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
        limiteCanjes: dto.limiteCanjes ?? 1,
      },
    });
  }

  async listar({ page, limit }: PaginationQueryDto) {
    const [data, total] = await Promise.all([
      this.prisma.promocion.findMany({
        include: { tienda: { select: { id: true, nombreComercial: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { titulo: 'asc' },
      }),
      this.prisma.promocion.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const promocion = await this.prisma.promocion.findUnique({
      where: { id },
      include: { tienda: true },
    });
    if (!promocion) {
      throw new NotFoundException('Promoción no encontrada');
    }
    return promocion;
  }

  async actualizar(id: string, dto: UpdatePromocionDto) {
    await this.findOne(id);
    return this.prisma.promocion.update({
      where: { id },
      data: {
        tiendaId: dto.tiendaId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
        limiteCanjes: dto.limiteCanjes,
      },
    });
  }

  async cambiarEstado(id: string, dto: CambiarEstadoDto) {
    await this.findOne(id);
    return this.prisma.promocion.update({ where: { id }, data: { estado: dto.estado } });
  }
}
