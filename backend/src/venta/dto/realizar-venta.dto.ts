import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RealizarVentaDto {
  @IsUUID()
  promocionId!: string;

  @IsUUID()
  productoId!: string;

  @IsString()
  @MinLength(2)
  nombreCompleto!: string;

  @IsString()
  @MinLength(6)
  dni!: string;

  @IsOptional()
  @IsString()
  detalle?: string;
}
