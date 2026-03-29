import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { AvailabilityService } from './availability.service';
import { Public } from '../../decorators/public.decorator';

export class CreateAvailabilityRuleDto {
  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  rrule: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  startTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  endTime: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateAvailabilityRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  rrule?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  endTime?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class AddExceptionDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class SlotsQueryDto {
  @IsUUID()
  providerId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('rules')
  async createRule(
    @Body() dto: CreateAvailabilityRuleDto,
    @Request() req: any,
  ) {
    return this.availabilityService.createRule(
      dto.providerId,
      {
        title: dto.title,
        rrule: dto.rrule,
        startTime: dto.startTime,
        endTime: dto.endTime,
        timezone: dto.timezone || 'UTC',
      },
      req.user.sub,
    );
  }

  @Get('rules/:providerId')
  async getRules(@Param('providerId', ParseUUIDPipe) providerId: string) {
    return this.availabilityService.findRulesByProvider(providerId);
  }

  @Patch('rules/:id')
  async updateRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAvailabilityRuleDto,
    @Request() req: any,
  ) {
    return this.availabilityService.updateRule(id, dto as any, req.user.sub);
  }

  @Delete('rules/:id')
  async deleteRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    await this.availabilityService.deleteRule(id, req.user.sub);
    return { message: 'Rule deactivated' };
  }

  @Post('rules/:id/exceptions')
  async addException(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddExceptionDto,
    @Request() req: any,
  ) {
    return this.availabilityService.addException(
      id,
      { date: dto.date, reason: dto.reason },
      req.user.sub,
    );
  }

  @Public()
  @Get('slots')
  async getSlots(@Query() query: SlotsQueryDto) {
    return this.availabilityService.getSlots(
      query.providerId,
      query.date,
      query.serviceId,
      query.timezone,
    );
  }
}
