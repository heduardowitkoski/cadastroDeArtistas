import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ArtistasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('artistas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findAprovados() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('artistas')
      .select('*')
      .eq('status', 'Aprovado')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(createDto: Record<string, unknown>) {
    const payload = { ...createDto };
    const senha = payload.senha as string | undefined;
    delete payload.senha;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl && payload.email && senha) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await adminClient.auth.admin.createUser({
          email: String(payload.email),
          password: senha,
          email_confirm: true,
        });
      } catch (err) {
        console.warn('Nota: Não foi possível auto-confirmar via Service Role:', err);
      }
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('artistas')
      .insert([{ ...payload, status: 'Pendente' }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(id: number, status: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('artistas')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: number, updateDto: Record<string, unknown>) {
    const payload = { ...updateDto };
    const forceStatus = payload.forceStatus === true;
    delete payload.forceStatus;
    if (!forceStatus) payload.status = 'Pendente';

    const { data, error } = await this.supabaseService
      .getClient()
      .from('artistas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: number) {
    const { error } = await this.supabaseService
      .getClient()
      .from('artistas')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Artista excluído com sucesso.' };
  }
}
