import { IsNotEmpty, IsUUID } from 'class-validator';

export class CompanyIdHeaderDto {
  @IsNotEmpty()
  @IsUUID()
  'company-id': string;
}
