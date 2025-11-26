import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator/';
import { User } from 'src/generated/prisma/client';
import { UserService } from './user.service';
import { UserScalarFieldEnum } from 'src/generated/prisma/internal/prismaNamespace';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getMe(@GetUser('id') userId: User, @GetUser('email') email: string) {
    return { userId, email };
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
