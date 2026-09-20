import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';

@Injectable()
export class ClienteService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  findAll() {
    return this.prisma.cliente.findMany();
  }
}
