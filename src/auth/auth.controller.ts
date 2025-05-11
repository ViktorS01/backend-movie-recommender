import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { Public } from './constants';

class SignInDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  @ApiBody({
    description: 'User credentials',
    type: SignInDto,
    required: true,
    examples: {
      user1: {
        summary: 'User1 Login Example',
        description: 'A sample login request',
        value: {
          username: 'a@test.com',
          password: 'root',
        },
      },
      user2: {
        summary: 'User2 Login Example',
        description: 'A sample login request',
        value: {
          username: 'b@test.com',
          password: 'root',
        },
      },
    },
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
