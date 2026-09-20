import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const QR_ID = 1;

@Injectable()
export class QrService {
  constructor(private readonly prisma: PrismaService) {}

  obtener() {
    return this.prisma.qrConfig.findUnique({ where: { id: QR_ID } });
  }

  guardar(url: string) {
    return this.prisma.qrConfig.upsert({
      where: { id: QR_ID },
      update: { url },
      create: { id: QR_ID, url },
    });
  }
}
