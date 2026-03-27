import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancelBookingCommand } from './cancel-booking.command';
import { Booking } from '../booking.entity';
import { BookingTokenService } from '../booking-token.service';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';

@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler
  implements ICommandHandler<CancelBookingCommand>
{
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly bookingTokenService: BookingTokenService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelBookingCommand): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: command.bookingId },
      relations: ['customer', 'provider'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    // Authorization check
    // 1. If access token provided and valid -> allow (token-based access)
    if (command.accessToken) {
      const isValidToken = this.bookingTokenService.validateToken(
        command.accessToken,
        booking.id,
        booking.customer.email,
      );
      if (!isValidToken) {
        throw new ForbiddenException('Invalid access token');
      }
      // Token is valid, proceed with cancellation
    }
    // 2. If userId matches booking's customer.userId -> allow (owner)
    else if (command.userId && booking.customer.userId && command.userId === booking.customer.userId) {
      // Owner access, allowed
    }
    // 3. If userId matches booking's provider's userId -> allow (provider)
    else if (command.userId && booking.provider && command.userId === booking.provider.userId) {
      // Provider access, allowed
    }
    // 4. Otherwise -> forbidden
    else {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    // Perform cancellation
    booking.status = 'cancelled';
    booking.cancellationReason = command.reason as any;

    const savedBooking = await this.bookingRepo.save(booking);

    // Emit event
    this.eventBus.publish(
      new BookingCancelledEvent(
        savedBooking.id,
        savedBooking.providerId,
        savedBooking.customerId,
        command.reason,
      ),
    );

    return savedBooking;
  }
}
