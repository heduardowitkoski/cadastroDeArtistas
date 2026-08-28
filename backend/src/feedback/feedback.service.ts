import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(createDto: Record<string, unknown>) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('feedbacks')
      .insert([createDto])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: number) {
    const { error } = await this.supabaseService
      .getClient()
      .from('feedbacks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Feedback excluído com sucesso.' };
  }
}
