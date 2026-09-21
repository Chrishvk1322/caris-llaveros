import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Se envía como multipart/form-data, así que todos los campos llegan como texto
// (`quitarFoto` es 'true'/'false', no un booleano).
export class UpdateProductoDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  codigo?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  quitarFoto?: string;
}
