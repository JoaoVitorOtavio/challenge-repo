import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(
    @Body()
    body: {
      email?: string;
      password?: string;
      token?: string;
      loginWithJwt?: boolean;
    },
  ) {
    if (body.loginWithJwt && body.token) {
      return this.authService.loginWithJwt(body.token);
    }

    if (!body.email || !body.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    return this.authService.login({
      email: body.email,
      password: body.password,
    });
  }
}
