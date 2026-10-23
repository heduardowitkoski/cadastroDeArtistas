import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { throwDatabaseError } from '../supabase/database-error';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

type DbResult<T> = {
  data: T;
  error: { message: string; code?: string } | null;
};

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false })) as DbResult<
      Record<string, unknown>[] | null
    >;

    if (error) throwDatabaseError(this.logger, 'feedbacks', 'select', error);
    return data;
  }

  async create(createDto: CreateFeedbackDto) {
    const { data, error } = (await this.supabaseService
      .getDatabaseClient()
      .from('feedbacks')
      .insert([createDto])
      .select()
      .single()) as DbResult<Record<string, unknown> | null>;

    if (error) throwDatabaseError(this.logger, 'feedbacks', 'insert', error);
    return data;
  }

  async delete(id: number) {
    const { error } = await this.supabaseService
      .getDatabaseClient()
      .from('feedbacks')
      .delete()
      .eq('id', id);

    if (error) throwDatabaseError(this.logger, 'feedbacks', 'delete', error);
    return { message: 'Feedback excluído com sucesso.' };
  }
}
