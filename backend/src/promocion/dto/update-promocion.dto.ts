import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class UpdatePromocionDto {
  @IsOptional()
  @IsUUID()
  tiendaId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limiteCanjes?: number;
}
