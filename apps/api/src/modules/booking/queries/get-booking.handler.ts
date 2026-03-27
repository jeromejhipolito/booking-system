import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetBookingQuery } from './get-booking.query';
import { Booking } from '../booking.entity';
import { BookingTokenService } from '../booking-token.service';

@QueryHandler(GetBookingQuery)
export class GetBookingHandler implements IQueryHandler<GetBookingQuery> {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly bookingTokenService: BookingTokenService,
  ) {}

  async execute(query: GetBookingQuery): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: query.bookingId },
      relations: ['service', 'provider', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If access token provided, validate it
    if (query.accessToken) {
      const isValid = this.bookingTokenService.validateToken(
        query.accessToken,
        booking.id,
        booking.customer.email,
      );
      if (isValid) {
        return booking;
      }
      throw new ForbiddenException('Invalid access token');
    }

    // If userId provided, check ownership
    if (query.userId) {
      const isOwner = booking.customer.userId === query.userId;
      const isProvider = booking.provider.userId === query.userId;
      if (!isOwner && !isProvider) {
        throw new ForbiddenException('You can only view your own bookings');
      }
    }

    return booking;
  }
}
