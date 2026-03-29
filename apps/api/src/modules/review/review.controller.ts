import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsUUID, IsInt, Min, Max, IsString, IsOptional, MaxLength } from 'class-validator';
import { ReviewService } from './review.service';
import { Public } from '../../decorators/public.decorator';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto';

export class CreateReviewDto {
  @IsUUID()
  bookingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    return this.reviewService.createReview(req.user.sub, dto);
  }

  @Public()
  @Get()
  async getReviews(@Query() query: GetReviewsQueryDto) {
    return this.reviewService.getReviewsByService(
      query.serviceId,
      query.page || 1,
      query.limit || 10,
    );
  }
}
