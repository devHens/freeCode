import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createAuthDto: CreateAuthDto) {   
    return this.authService.signup(createAuthDto);
  } 
  @HttpCode(200)
  @Post('signin')
  async signin(@Body() createAuthDto: CreateAuthDto) {
    
    return this.authService.signin(createAuthDto);
  }
}
