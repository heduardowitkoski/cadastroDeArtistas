import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.feedbackService.create(body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.feedbackService.delete(Number(id));
  }
}
