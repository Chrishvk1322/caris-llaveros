import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { calcularEstadoCanje } from '../common/utils/estado-canje.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SELECT_PRODUCTO, toProductoDto } from '../producto/producto.util.js';
import { RealizarVentaDto } from './dto/realizar-venta.dto.js';

const SELECT_LISTADO = {
  id: true,
  tokenUrl: true,
  createdAt: true,
  canjesRealizados: true,
  cliente: { select: { nombreCompleto: true, dni: true } },
  promocion: {
    select: { titulo: true, limiteCanjes: true, tienda: { select: { nombreComercial: true } } },
  },
} as const;

const INCLUDE_DETALLE = {
  cliente: true,
  promocion: {
    include: { tienda: { select: { id: true, nombreComercial: true, estado: true } } },
  },
  producto: { select: SELECT_PRODUCTO },
  canjes: { orderBy: { fecha: 'desc' as const } },
} as const;

function mapListado(venta: {
  id: string;
  tokenUrl: string;
  createdAt: Date;
  canjesRealizados: number;
  cliente: { nombreCompleto: string; dni: string } | null;
  promocion: { titulo: string; limiteCanjes: number; tienda: { nombreComercial: string } };
}) {
  const { estado, canjesRestantes } = calcularEstadoCanje(
    venta.canjesRealizados,
    venta.promocion.limiteCanjes,
  );
  return {
    id: venta.id,
    tokenUrl: venta.tokenUrl,
    createdAt: venta.createdAt,
    canjesRealizados: venta.canjesRealizados,
    canjesRestantes,
    estado,
    cliente: venta.cliente,
    promocion: venta.promocion,
  };
}

@Injectable()
export class VentaService {
  constructor(private readonly prisma: PrismaService) {}

  async realizarVenta(dto: RealizarVentaDto) {
    const promocion = await this.prisma.promocion.findUnique({ where: { id: dto.promocionId } });
    if (!promocion) {
      throw new NotFoundException('Promoción no encontrada');
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id: dto.productoId },
      select: { id: true, codigo: true, nombre: true, estado: true },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    if (!producto.estado) {
      throw new BadRequestException('El producto está inactivo y no se puede vender');
    }

    const cliente = await this.prisma.cliente.upsert({
      where: { dni: dto.dni },
      update: {},
      create: { nombreCompleto: dto.nombreCompleto, dni: dto.dni },
    });

    const venta = await this.prisma.ventaLlavero.create({
      data: {
        clienteId: cliente.id,
        promocionId: dto.promocionId,
        productoId: producto.id,
        detalle: dto.detalle,
      },
    });

    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:4200';
    return {
      id: venta.id,
      tokenUrl: venta.tokenUrl,
      url: `${baseUrl}/nfc/${venta.tokenUrl}`,
      detalle: venta.detalle,
      cliente: { nombreCompleto: cliente.nombreCompleto, dni: cliente.dni },
      producto: { codigo: producto.codigo, nombre: producto.nombre },
    };
  }

  async listar({ page, limit }: PaginationQueryDto) {
    const [data, total] = await Promise.all([
      this.prisma.ventaLlavero.findMany({
        select: SELECT_LISTADO,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ventaLlavero.count(),
    ]);
    return { data: data.map(mapListado), total, page, limit };
  }

  private async buscarDetalle(id: string) {
    const venta = await this.prisma.ventaLlavero.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }
    return venta;
  }

  async obtenerDetalle(id: string) {
    const venta = await this.buscarDetalle(id);
    const { estado, canjesRestantes } = calcularEstadoCanje(
      venta.canjesRealizados,
      venta.promocion.limiteCanjes,
    );
    return {
      ...venta,
      producto: venta.producto ? toProductoDto(venta.producto) : null,
      estado,
      canjesRestantes,
      historialCanjes: venta.canjes.map((canje) => ({ fecha: canje.fecha })),
    };
  }

  async reactivar(id: string) {
    await this.buscarDetalle(id);
    await this.prisma.ventaLlavero.update({ where: { id }, data: { canjesRealizados: 0 } });
    return this.obtenerDetalle(id);
  }
}
