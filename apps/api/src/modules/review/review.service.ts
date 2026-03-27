import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './review.entity';
import { Booking } from '../booking/booking.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async createReview(userId: string, dto: { bookingId: string; rating: number; comment?: string }) {
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
      relations: ['customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer?.userId !== userId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.status !== 'completed') {
      throw new BadRequestException('Can only review completed bookings');
    }

    const existing = await this.reviewRepo.findOne({ where: { bookingId: dto.bookingId } });
    if (existing) {
      throw new ConflictException('Booking already reviewed');
    }

    const review = this.reviewRepo.create({
      bookingId: dto.bookingId,
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      providerId: booking.providerId,
      rating: dto.rating,
      comment: dto.comment || null,
      status: ReviewStatus.PUBLISHED,
    });

    return this.reviewRepo.save(review);
  }

  async getReviewsByService(serviceId: string, page = 1, limit = 10) {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { serviceId, status: ReviewStatus.PUBLISHED },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    const aggResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(*)', 'count')
      .where('review.service_id = :serviceId', { serviceId })
      .andWhere('review.status = :status', { status: ReviewStatus.PUBLISHED })
      .getRawOne();

    const averageRating = aggResult?.avgRating ? parseFloat(parseFloat(aggResult.avgRating).toFixed(1)) : 0;
    const reviewCount = parseInt(aggResult?.count || '0', 10);

    return {
      data: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewerName: r.customer
          ? `${r.customer.firstName} ${r.customer.lastName?.[0] || ''}.`
          : 'Anonymous',
      })),
      meta: {
        averageRating,
        reviewCount,
        page,
        limit: take,
        total,
      },
    };
  }
}
