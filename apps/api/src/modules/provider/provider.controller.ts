import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ProviderService } from './provider.service';
import { Public } from '../../decorators/public.decorator';

export class CreateProviderDto {
  @IsString()
  @MaxLength(255)
  businessName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}

@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateProviderDto) {
    return this.providerService.create({
      userId: req.user.sub,
      businessName: dto.businessName,
      description: dto.description,
      phone: dto.phone,
      timezone: dto.timezone || 'UTC',
      address: dto.address,
    });
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderDto,
    @Request() req: any,
  ) {
    return this.providerService.update(id, dto as any, req.user.sub);
  }
}
