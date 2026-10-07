import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

type DbResult<T> = {
  data: T;
  error: { message: string } | null;
};

@Injectable()
export class FeedbackService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false })) as DbResult<
      Record<string, unknown>[] | null
    >;

    if (error) throw new Error(error.message);
    return data;
  }

  async create(createDto: CreateFeedbackDto) {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('feedbacks')
      .insert([createDto])
      .select()
      .single()) as DbResult<Record<string, unknown> | null>;

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: number) {
    const { error } = await this.supabaseService
      .getDatabaseClient()
      .from('feedbacks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Feedback excluído com sucesso.' };
  }
}
