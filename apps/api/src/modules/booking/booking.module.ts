import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Booking } from './booking.entity';
import { BookingController } from './booking.controller';
import { BookingTokenService } from './booking-token.service';
import { CreateBookingHandler } from './commands/create-booking.handler';
import { CancelBookingHandler } from './commands/cancel-booking.handler';
import { RescheduleBookingHandler } from './commands/reschedule-booking.handler';
import { GetBookingHandler } from './queries/get-booking.handler';
import { ListBookingsHandler } from './queries/list-bookings.handler';
import { CustomerModule } from '../customer/customer.module';
import { Service } from '../service/service.entity';

const CommandHandlers = [
  CreateBookingHandler,
  CancelBookingHandler,
  RescheduleBookingHandler,
];

const QueryHandlers = [GetBookingHandler, ListBookingsHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Service]),
    CqrsModule,
    CustomerModule,
  ],
  controllers: [BookingController],
  providers: [BookingTokenService, ...CommandHandlers, ...QueryHandlers],
  exports: [BookingTokenService],
})
export class BookingModule {}
