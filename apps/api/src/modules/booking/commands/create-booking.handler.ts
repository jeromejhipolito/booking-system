import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingCommand } from './create-booking.command';
import { Booking } from '../booking.entity';
import { Service } from '../../service/service.entity';
import { CustomerService } from '../../customer/customer.service';
import { BookingTokenService } from '../booking-token.service';
import { BookingConfirmedEvent } from '../events/booking-confirmed.event';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler
  implements ICommandHandler<CreateBookingCommand>
{
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    private readonly customerService: CustomerService,
    private readonly bookingTokenService: BookingTokenService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateBookingCommand): Promise<Booking> {
    // Idempotency check
    if (command.idempotencyKey) {
      const existing = await this.bookingRepo.findOne({
        where: { idempotencyKey: command.idempotencyKey },
        relations: ['service', 'provider', 'customer'],
      });
      if (existing) {
        return existing;
      }
    }

    // Load service
    const service = await this.serviceRepo.findOne({
      where: { id: command.serviceId },
      relations: ['provider'],
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (!service.isActive) {
      throw new BadRequestException('Service is not active');
    }

    // Find or create customer
    const customer = await this.customerService.findOrCreateByEmail({
      email: command.customerEmail,
      firstName: command.customerFirstName,
      lastName: command.customerLastName,
      phone: command.customerPhone,
      userId: command.userId,
    });

    // Calculate end time
    const startTime = new Date(command.startTime);
    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60 * 1000,
    );

    // Build booking entity
    const booking = this.bookingRepo.create({
      serviceId: service.id,
      providerId: service.providerId,
      customerId: customer.id,
      startTime,
      endTime,
      status: service.provider?.settings?.autoConfirm !== false ? 'confirmed' : 'pending',
      notes: command.notes,
      idempotencyKey: command.idempotencyKey,
      metadata: {},
    });

    // Generate access token
    // We generate a temporary id for the token, will update after save
    let savedBooking: Booking;
    try {
      savedBooking = await this.bookingRepo.save(booking);
    } catch (error: any) {
      // PostgreSQL error code 23P01 = exclusion_violation (double booking)
      if (error.code === '23P01') {
        throw new ConflictException(
          'This time slot is already booked. Please choose a different time.',
        );
      }
      throw error;
    }

    // Generate and save access token
    const accessToken = this.bookingTokenService.generateToken(
      savedBooking.id,
      customer.email,
    );
    savedBooking.accessToken = accessToken;
    savedBooking = await this.bookingRepo.save(savedBooking);

    // Emit event
    this.eventBus.publish(
      new BookingConfirmedEvent(
        savedBooking.id,
        savedBooking.serviceId,
        savedBooking.providerId,
        savedBooking.customerId,
        savedBooking.startTime,
        savedBooking.endTime,
        customer.email,
        accessToken,
      ),
    );

    // Load relations for response
    return this.bookingRepo.findOne({
      where: { id: savedBooking.id },
      relations: ['service', 'provider', 'customer'],
    }) as Promise<Booking>;
  }
}
