import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDTO } from 'src/users/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: { email: string; password: string }) {
    try {
      const userOnDb = await this.usersService.findOneByEmail(user.email);

      if (!userOnDb) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      const passwordMatch = await bcrypt.compare(
        user.password,
        userOnDb.password,
      );

      if (!passwordMatch) {
        throw new UnauthorizedException('Senha incorreta.');
      }

      const result: Partial<UserDTO> = { ...userOnDb };
      delete result.password;

      return {
        user: result,
        token: this.jwtService.sign(result, { expiresIn: '1h' }),
      };
    } catch (error: any) {
      if (error instanceof Error) {
        throw new BadRequestException(error?.message || 'Erro ao fazer login');
      }

      throw new UnauthorizedException('Erro ao fazer login');
    }
  }

  async loginWithJwt(token: string) {
    try {
      interface JwtPayload {
        email: string;
        id: number;
        nome?: string;
      }

      const decoded: JwtPayload = this.jwtService.verify(token);

      if (!decoded || !decoded.email) {
        throw new UnauthorizedException('Token inválido');
      }

      const userOnDb = await this.usersService.findOneByEmail(decoded.email);

      if (!userOnDb) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const result: Partial<UserDTO> = { ...userOnDb };
      delete result.password;

      // Opcional: emitir novo token se quiser renovar
      return {
        user: result,
        token: this.jwtService.sign(result),
      };
    } catch (error: any) {
      if (error instanceof Error) {
        if (error.message === 'invalid signature') {
          throw new UnauthorizedException('Token inválido!');
        }

        throw new UnauthorizedException(
          error?.message || 'Token inválido ou expirado',
        );
      }

      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
