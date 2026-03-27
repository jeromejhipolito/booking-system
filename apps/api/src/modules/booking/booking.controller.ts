import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBookingCommand } from './commands/create-booking.command';
import { CancelBookingCommand } from './commands/cancel-booking.command';
import { RescheduleBookingCommand } from './commands/reschedule-booking.command';
import { GetBookingQuery } from './queries/get-booking.query';
import { ListBookingsQuery } from './queries/list-bookings.query';
import { Public } from '../../decorators/public.decorator';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  startTime: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  customerFirstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  customerLastName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  token?: string;
}

export class RescheduleBookingDto {
  @IsDateString()
  newStartTime: string;

  @IsOptional()
  @IsString()
  token?: string;
}

export class ListBookingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateBookingDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.commandBus.execute(
      new CreateBookingCommand(
        dto.serviceId,
        dto.startTime,
        dto.customerEmail,
        dto.customerFirstName,
        dto.customerLastName,
        dto.customerPhone,
        dto.notes,
        dto.idempotencyKey,
        userId,
      ),
    );
  }

  @Get()
  async list(@Query() query: ListBookingsQueryDto, @Request() req: any) {
    return this.queryBus.execute(
      new ListBookingsQuery(
        req.user.sub,
        req.user.role,
        query.page || 1,
        query.limit || 20,
        query.status,
        query.providerId,
      ),
    );
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('token') token: string,
    @Request() req: any,
  ) {
    return this.queryBus.execute(
      new GetBookingQuery(id, req.user?.sub, token),
    );
  }

  @Public()
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    return this.commandBus.execute(
      new CancelBookingCommand(id, dto.reason, userId, dto.token),
    );
  }

  @Public()
  @Patch(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleBookingDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    return this.commandBus.execute(
      new RescheduleBookingCommand(id, dto.newStartTime, userId, dto.token),
    );
  }
}
