import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  PUBLIC_ARTISTA_COLUMNS,
  PublicArtista,
  toPublicArtista,
} from './public-artista';

import { CreateArtistaDto } from './dto/create-artista.dto';
import { UpdateArtistaDto } from './dto/update-artista.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

type DbResult<T> = {
  data: T;
  error: { message: string; code?: string } | null;
};

@Injectable()
export class ArtistasService {
  private readonly logger = new Logger(ArtistasService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('artistas')
      .select('*')
      .order('created_at', { ascending: false })) as DbResult<
      Record<string, unknown>[] | null
    >;

    if (error) throw new Error(error.message);
    return data;
  }

  async findAprovados() {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('artistas')
      .select(PUBLIC_ARTISTA_COLUMNS)
      .eq('status', 'Aprovado')
      .order('created_at', { ascending: false })) as DbResult<
      PublicArtista[] | null
    >;

    if (error) throw new Error(error.message);
    return (data ?? []).map(toPublicArtista);
  }

  async create(createDto: CreateArtistaDto) {
    const { senha, ...payload } = createDto;
    const databaseClient = this.supabaseService.getDatabaseClient();
    const { data: existing, error: lookupError } = (await databaseClient
      .from('artistas')
      .select('id')
      .eq('email', createDto.email)
      .limit(1)) as DbResult<{ id: number }[] | null>;
    if (lookupError) {
      throw new ServiceUnavailableException(
        'Não foi possível verificar o e-mail do cadastro.',
      );
    }
    if (existing?.length) {
      throw new ConflictException('Este e-mail já possui um cadastro.');
    }
    const userId = await this.createAuthUser(createDto.email, senha);

    let result: DbResult<{ id: number } | null> | null = null;
    try {
      result = await databaseClient
        .from('artistas')
        .insert([{ ...payload, status: 'Pendente' }])
        .select('id')
        .single();
    } catch {
      // Sem resposta do banco, o commit pode ter ocorrido; não apagar Auth às cegas.
    }

    if (!result) {
      this.logger.error(
        'Resultado ambíguo ao inserir ficha; revisão manual necessária.',
      );
      throw new ServiceUnavailableException(
        'Cadastro sem confirmação. Contate o suporte antes de tentar novamente.',
      );
    }
    if (result.error) {
      await this.compensateNewUser(userId);
      if (result.error.code === '23505') {
        throw new ConflictException('Já existe um cadastro com este e-mail.');
      }
      throw new ServiceUnavailableException(
        'Não foi possível salvar o cadastro. Tente novamente.',
      );
    }
    if (!result.data) {
      this.logger.error(
        'Ficha sem confirmação após inserção; revisão manual necessária.',
      );
      throw new ServiceUnavailableException(
        'Cadastro sem confirmação. Contate o suporte antes de tentar novamente.',
      );
    }
    return { id: result.data.id, status: 'Pendente' };
  }

  private async createAuthUser(email: string, senha: string): Promise<string> {
    try {
      const { data, error } = await this.supabaseService
        .getDatabaseClient()
        .auth.admin.createUser({
          email,
          password: senha,
          email_confirm: false,
        });
      if (error) {
        if (
          ['email_exists', 'user_already_exists'].includes(error.code ?? '')
        ) {
          throw new ConflictException('Este e-mail já possui uma conta.');
        }
        if (
          ['validation_failed', 'email_address_invalid'].includes(
            error.code ?? '',
          )
        ) {
          throw new BadRequestException('E-mail inválido para cadastro.');
        }
        if (error.code === 'weak_password') {
          throw new BadRequestException(
            'A senha não atende à política de segurança do Supabase.',
          );
        }
        throw new ServiceUnavailableException(
          'Não foi possível criar a conta de acesso.',
        );
      }
      if (!data.user?.id) {
        throw new ServiceUnavailableException(
          'Não foi possível confirmar a criação da conta.',
        );
      }
      return data.user.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(
        'Não foi possível acessar o serviço de autenticação.',
      );
    }
  }

  private async compensateNewUser(userId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getDatabaseClient()
        .auth.admin.deleteUser(userId);
      if (error) throw error;
    } catch {
      this.logger.error(
        'Falha ao compensar conta recém-criada após erro no cadastro.',
      );
      throw new ServiceUnavailableException(
        'Cadastro incompleto. Contate o suporte antes de tentar novamente.',
      );
    }
  }

  async updateStatus(id: number, status: UpdateStatusDto['status']) {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('artistas')
      .update({ status })
      .eq('id', id)
      .select()
      .single()) as DbResult<Record<string, unknown> | null>;

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: number, updateDto: UpdateArtistaDto) {
    const payload = { ...updateDto };
    const forceStatus = payload.forceStatus === true;
    delete payload.forceStatus;
    if (!forceStatus) payload.status = 'Pendente';

    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('artistas')
      .update(payload)
      .eq('id', id)
      .select()
      .single()) as DbResult<Record<string, unknown> | null>;

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: number) {
    const { error } = await this.supabaseService
      .getDatabaseClient()
      .from('artistas')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Artista excluído com sucesso.' };
  }
}
