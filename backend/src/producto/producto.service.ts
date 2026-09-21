import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CambiarEstadoDto } from '../common/dto/cambiar-estado.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListarProductosQueryDto } from './dto/buscar-producto-query.dto.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { SELECT_PRODUCTO, toProductoDto } from './producto.util.js';

const LIMITE_BUSCADOR = 10;

function filtroBusqueda(q?: string) {
  if (!q) {
    return {};
  }
  return {
    OR: [
      { codigo: { contains: q, mode: 'insensitive' as const } },
      { nombre: { contains: q, mode: 'insensitive' as const } },
    ],
  };
}

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarCodigoLibre(codigo: string, ignorarId?: string) {
    const existente = await this.prisma.producto.findUnique({
      where: { codigo },
      select: { id: true },
    });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException(`Ya existe un producto con el código "${codigo}"`);
    }
  }

  async create(dto: CreateProductoDto, foto?: Express.Multer.File) {
    await this.validarCodigoLibre(dto.codigo);
    const producto = await this.prisma.producto.create({
      data: {
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion || null,
        ...(foto ? { foto: new Uint8Array(foto.buffer), fotoMime: foto.mimetype } : {}),
      },
      select: SELECT_PRODUCTO,
    });
    return toProductoDto(producto);
  }

  async listar({ page, limit, q }: ListarProductosQueryDto) {
    const where = filtroBusqueda(q);
    const [data, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        select: SELECT_PRODUCTO,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.producto.count({ where }),
    ]);
    return { data: data.map(toProductoDto), total, page, limit };
  }

  /** Buscador de "Realizar venta": solo productos activos, tope fijo de resultados. */
  async buscarActivos(q?: string) {
    const data = await this.prisma.producto.findMany({
      where: { estado: true, ...filtroBusqueda(q) },
      select: SELECT_PRODUCTO,
      take: LIMITE_BUSCADOR,
      orderBy: { nombre: 'asc' },
    });
    return data.map(toProductoDto);
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      select: SELECT_PRODUCTO,
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return toProductoDto(producto);
  }

  async obtenerFoto(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      select: { foto: true, fotoMime: true },
    });
    if (!producto?.foto || !producto.fotoMime) {
      throw new NotFoundException('El producto no tiene foto');
    }
    return { foto: producto.foto, mime: producto.fotoMime };
  }

  async actualizar(id: string, dto: UpdateProductoDto, foto?: Express.Multer.File) {
    await this.findOne(id);
    if (dto.codigo !== undefined) {
      await this.validarCodigoLibre(dto.codigo, id);
    }

    let fotoData: { foto: Uint8Array<ArrayBuffer> | null; fotoMime: string | null } | undefined;
    if (foto) {
      fotoData = { foto: new Uint8Array(foto.buffer), fotoMime: foto.mimetype };
    } else if (dto.quitarFoto === 'true') {
      fotoData = { foto: null, fotoMime: null };
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: {
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion === undefined ? undefined : dto.descripcion || null,
        ...fotoData,
      },
      select: SELECT_PRODUCTO,
    });
    return toProductoDto(producto);
  }

  async cambiarEstado(id: string, dto: CambiarEstadoDto) {
    await this.findOne(id);
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { estado: dto.estado },
      select: SELECT_PRODUCTO,
    });
    return toProductoDto(producto);
  }
}
