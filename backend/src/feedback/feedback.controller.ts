import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AdminOnly } from '../auth/admin-only.decorator';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @AdminOnly()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Post()
  create(@Body() body: CreateFeedbackDto) {
    return this.feedbackService.create(body);
  }

  @Delete(':id')
  @AdminOnly()
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.delete(id);
  }
}
