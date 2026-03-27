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
  IsNumber,
  IsIn,
  IsInt,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceService } from './service.service';
import { Public } from '../../decorators/public.decorator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  providerId: string;

  @IsOptional()
  @IsIn(['appointment', 'class', 'event', 'workshop'])
  serviceType?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class ServiceQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

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
}

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  async create(@Body() dto: CreateServiceDto, @Request() req: any) {
    return this.serviceService.create({
      providerId: dto.providerId,
      name: dto.name,
      description: dto.description,
      serviceType: dto.serviceType || 'appointment',
      durationMinutes: dto.durationMinutes || 60,
      bufferMinutes: dto.bufferMinutes ?? 15,
      price: dto.price,
      currency: dto.currency || 'USD',
      maxParticipants: dto.maxParticipants || 1,
      config: dto.config || {},
    });
  }

  @Public()
  @Get()
  async findAll(@Query() query: ServiceQueryDto) {
    return this.serviceService.findAll({
      search: query.search,
      providerId: query.providerId,
      serviceType: query.serviceType,
      page: query.page,
      limit: query.limit,
    });
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @Request() req: any,
  ) {
    return this.serviceService.update(id, dto as any, req.user.sub);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    await this.serviceService.remove(id, req.user.sub);
    return { message: 'Service deactivated' };
  }
}
