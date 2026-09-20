import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { calcularEstadoCanje } from '../common/utils/estado-canje.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AplicarPinDto } from './dto/aplicar-pin.dto.js';

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 15 * 60 * 1000;

interface IntentoFallido {
  count: number;
  lockedUntil: number | null;
}

@Injectable()
export class CanjeService {
  private readonly intentos = new Map<string, IntentoFallido>();

  constructor(private readonly prisma: PrismaService) {}

  private async buscarVenta(token: string) {
    const venta = await this.prisma.ventaLlavero.findUnique({
      where: { tokenUrl: token },
      include: { promocion: { include: { tienda: true } }, cliente: true },
    });
    if (!venta) {
      throw new NotFoundException('Llavero no encontrado');
    }
    return venta;
  }

  async buscarPorDni(dni: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { dni },
      include: {
        ventasLlavero: {
          orderBy: { createdAt: 'desc' },
          include: {
            promocion: {
              select: {
                titulo: true,
                descripcion: true,
                fechaVencimiento: true,
                limiteCanjes: true,
                tienda: { select: { nombreComercial: true } },
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('No encontramos ninguna promoción registrada con ese DNI');
    }

    return {
      cliente: { nombreCompleto: cliente.nombreCompleto, dni: cliente.dni },
      ventas: cliente.ventasLlavero.map((venta) => {
        const { estado, canjesRestantes } = calcularEstadoCanje(
          venta.canjesRealizados,
          venta.promocion.limiteCanjes,
        );
        return {
          tokenUrl: venta.tokenUrl,
          createdAt: venta.createdAt,
          estado,
          canjesRestantes,
          limiteCanjes: venta.promocion.limiteCanjes,
          promocion: {
            titulo: venta.promocion.titulo,
            descripcion: venta.promocion.descripcion,
            fechaVencimiento: venta.promocion.fechaVencimiento,
          },
          tienda: venta.promocion.tienda.nombreComercial,
        };
      }),
    };
  }

  async resolverEstado(token: string) {
    const venta = await this.buscarVenta(token);
    const { estado, canjesRestantes } = calcularEstadoCanje(
      venta.canjesRealizados,
      venta.promocion.limiteCanjes,
    );
    return {
      estado,
      canjesRestantes,
      limiteCanjes: venta.promocion.limiteCanjes,
      promocion: {
        titulo: venta.promocion.titulo,
        descripcion: venta.promocion.descripcion,
        fechaVencimiento: venta.promocion.fechaVencimiento,
      },
      tienda: venta.promocion.tienda.nombreComercial,
      cliente: venta.cliente
        ? { nombreCompleto: venta.cliente.nombreCompleto, dni: venta.cliente.dni }
        : null,
    };
  }

  private verificarBloqueo(token: string) {
    const intento = this.intentos.get(token);
    if (intento?.lockedUntil && intento.lockedUntil > Date.now()) {
      throw new HttpException(
        'Demasiados intentos fallidos. Intenta nuevamente en unos minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registrarFallo(token: string) {
    const intento = this.intentos.get(token) ?? { count: 0, lockedUntil: null };
    intento.count += 1;
    if (intento.count >= MAX_INTENTOS) {
      intento.lockedUntil = Date.now() + BLOQUEO_MS;
      intento.count = 0;
    }
    this.intentos.set(token, intento);
  }

  async aplicarPin(token: string, dto: AplicarPinDto) {
    this.verificarBloqueo(token);

    const venta = await this.buscarVenta(token);
    const { estado: estadoActual } = calcularEstadoCanje(
      venta.canjesRealizados,
      venta.promocion.limiteCanjes,
    );

    if (estadoActual === 'AGOTADO') {
      throw new BadRequestException('Esta promoción ya alcanzó el límite de canjes');
    }

    const pinValido = await bcrypt.compare(dto.pin, venta.promocion.tienda.pinCajero);
    if (!pinValido) {
      this.registrarFallo(token);
      throw new BadRequestException('PIN incorrecto');
    }

    this.intentos.delete(token);

    const [ventaActualizada] = await this.prisma.$transaction([
      this.prisma.ventaLlavero.update({
        where: { tokenUrl: token },
        data: { canjesRealizados: { increment: 1 } },
      }),
      this.prisma.canje.create({ data: { ventaLlaveroId: venta.id } }),
    ]);

    const { estado, canjesRestantes } = calcularEstadoCanje(
      ventaActualizada.canjesRealizados,
      venta.promocion.limiteCanjes,
    );
    return { estado, canjesRestantes, limiteCanjes: venta.promocion.limiteCanjes };
  }
}
