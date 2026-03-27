import { CommandHandler, ICommandHandler, EventBus, CommandBus } from '@nestjs/cqrs';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RescheduleBookingCommand } from './reschedule-booking.command';
import { Booking } from '../booking.entity';
import { BookingTokenService } from '../booking-token.service';
import { BookingRescheduledEvent } from '../events/booking-rescheduled.event';
import { CustomerService } from '../../customer/customer.service';
import { Service } from '../../service/service.entity';

@CommandHandler(RescheduleBookingCommand)
export class RescheduleBookingHandler
  implements ICommandHandler<RescheduleBookingCommand>
{
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    private readonly bookingTokenService: BookingTokenService,
    private readonly customerService: CustomerService,
    private readonly eventBus: EventBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: RescheduleBookingCommand): Promise<Booking> {
    const oldBooking = await this.bookingRepo.findOne({
      where: { id: command.bookingId },
      relations: ['customer', 'provider', 'service'],
    });

    if (!oldBooking) {
      throw new NotFoundException('Booking not found');
    }

    if (oldBooking.status === 'cancelled') {
      throw new BadRequestException('Cannot reschedule a cancelled booking');
    }

    if (oldBooking.status === 'completed') {
      throw new BadRequestException('Cannot reschedule a completed booking');
    }

    // Authorization check (same logic as cancel)
    if (command.accessToken) {
      const isValidToken = this.bookingTokenService.validateToken(
        command.accessToken,
        oldBooking.id,
        oldBooking.customer.email,
      );
      if (!isValidToken) {
        throw new ForbiddenException('Invalid access token');
      }
    } else if (
      command.userId &&
      oldBooking.customer.userId &&
      command.userId === oldBooking.customer.userId
    ) {
      // Owner access
    } else if (
      command.userId &&
      oldBooking.provider &&
      command.userId === oldBooking.provider.userId
    ) {
      // Provider access
    } else {
      throw new ForbiddenException('You can only reschedule your own bookings');
    }

    // Load service for duration
    const service = await this.serviceRepo.findOne({
      where: { id: oldBooking.serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const newStartTime = new Date(command.newStartTime);
    const newEndTime = new Date(
      newStartTime.getTime() + service.durationMinutes * 60 * 1000,
    );

    // Use transaction: cancel old + create new
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Cancel old booking
      oldBooking.status = 'cancelled';
      oldBooking.cancellationReason = 'Rescheduled';
      await queryRunner.manager.save(oldBooking);

      // Create new booking preserving context
      const newBooking = this.bookingRepo.create({
        serviceId: oldBooking.serviceId,
        providerId: oldBooking.providerId,
        customerId: oldBooking.customerId,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'confirmed',
        notes: oldBooking.notes,
        metadata: {
          ...oldBooking.metadata,
          rescheduledFrom: oldBooking.id,
        },
      });

      let savedNewBooking: Booking;
      try {
        savedNewBooking = await queryRunner.manager.save(newBooking);
      } catch (error: any) {
        if (error.code === '23P01') {
          throw new BadRequestException(
            'The new time slot is already booked. Please choose a different time.',
          );
        }
        throw error;
      }

      // Generate access token for new booking
      const accessToken = this.bookingTokenService.generateToken(
        savedNewBooking.id,
        oldBooking.customer.email,
      );
      savedNewBooking.accessToken = accessToken;
      savedNewBooking = await queryRunner.manager.save(savedNewBooking);

      await queryRunner.commitTransaction();

      // Emit event
      this.eventBus.publish(
        new BookingRescheduledEvent(
          oldBooking.id,
          savedNewBooking.id,
          savedNewBooking.providerId,
          savedNewBooking.customerId,
          savedNewBooking.startTime,
          savedNewBooking.endTime,
        ),
      );

      return this.bookingRepo.findOne({
        where: { id: savedNewBooking.id },
        relations: ['service', 'provider', 'customer'],
      }) as Promise<Booking>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
