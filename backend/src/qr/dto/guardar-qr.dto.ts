import { IsString, IsUrl } from 'class-validator';

export class GuardarQrDto {
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'], require_tld: false })
  url!: string;
}
