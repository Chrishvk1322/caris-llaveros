import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateTiendaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  @Length(4, 4, { message: 'El PIN de cajero debe tener exactamente 4 dígitos' })
  pin?: string;
}
