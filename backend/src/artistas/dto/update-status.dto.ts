import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['Pendente', 'Aprovado', 'Rejeitado'])
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}
