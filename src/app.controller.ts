import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';

@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/profile')
  getMyProfile(@Request() req) {
    const user = this.usersService.findOne(req.user.username);
    return this.appService.findProfile(user!);
  }
}
