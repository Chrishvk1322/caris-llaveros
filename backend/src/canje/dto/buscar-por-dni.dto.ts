import { IsString, MinLength } from 'class-validator';

export class BuscarPorDniDto {
  @IsString()
  @MinLength(6)
  dni!: string;
}
