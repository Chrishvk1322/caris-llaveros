import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CambiarEstadoDto } from '../common/dto/cambiar-estado.dto.js';
import { BuscarProductoQueryDto, ListarProductosQueryDto } from './dto/buscar-producto-query.dto.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { ProductoService } from './producto.service.js';

const FOTO_MAX_BYTES = 1024 * 1024;
const FOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const subidaFoto = FileInterceptor('foto', {
  limits: { fileSize: FOTO_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (FOTO_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('La foto debe ser JPG, PNG o WebP'), false);
    }
  },
});

@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  // Pública a propósito: se usa desde <img src>, que no puede enviar el Bearer.
  // Es una foto de catálogo (no un dato sensible) y sin throttle porque un listado
  // dispara una petición por foto y agotaría el límite por IP.
  @Get(':id/foto')
  @SkipThrottle()
  @Header('Cache-Control', 'public, max-age=86400')
  @Header('X-Content-Type-Options', 'nosniff')
  async foto(@Param('id') id: string) {
    const { foto, mime } = await this.productoService.obtenerFoto(id);
    return new StreamableFile(foto, { type: mime });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(subidaFoto)
  create(@Body() dto: CreateProductoDto, @UploadedFile() foto?: Express.Multer.File) {
    return this.productoService.create(dto, foto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listar(@Query() query: ListarProductosQueryDto) {
    return this.productoService.listar(query);
  }

  // Debe declararse antes de @Get(':id'), o Express lo tomaría como un id "buscar".
  @Get('buscar')
  @UseGuards(JwtAuthGuard)
  buscar(@Query() query: BuscarProductoQueryDto) {
    return this.productoService.buscarActivos(query.q);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(subidaFoto)
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.productoService.actualizar(id, dto, foto);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard)
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoDto) {
    return this.productoService.cambiarEstado(id, dto);
  }
}
