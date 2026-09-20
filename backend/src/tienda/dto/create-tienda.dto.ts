import { IsString, Length, MinLength } from 'class-validator';

export class CreateTiendaDto {
  @IsString()
  @MinLength(2)
  nombreComercial!: string;

  @IsString()
  @Length(4, 4, { message: 'El PIN de cajero debe tener exactamente 4 dígitos' })
  pin!: string;
}
