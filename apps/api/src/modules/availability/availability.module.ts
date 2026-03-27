import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityRule } from './availability-rule.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { AvailabilityGateway } from './availability.gateway';
import { SlotExpansionService } from './slot-expansion.service';
import { ProviderModule } from '../provider/provider.module';
import { Booking } from '../booking/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvailabilityRule, Booking]),
    ProviderModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, SlotExpansionService, AvailabilityGateway],
  exports: [AvailabilityService, AvailabilityGateway, SlotExpansionService],
})
export class AvailabilityModule {}
