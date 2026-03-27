import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
} from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { UserService } from './user.service';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.userService.findById(req.user.sub);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Patch('me')
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(req.user.sub, dto);
    const { passwordHash, ...result } = user;
    return result;
  }
}
