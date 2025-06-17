/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { updateUserDTO, createUserDTO } from './users.dto';
import * as bcrypt from 'bcrypt';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {}

  async create(data: createUserDTO): Promise<Users> {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      data.password = hashedPassword;

      const user = this.usersRepo.create(data);
      const result = await this.usersRepo.save(user);

      return result;
    } catch (error: any) {
      if (typeof error === 'object' && error !== null) {
        const err = error as {
          code?: string;
          detail?: string;
          driverError?: { code?: string; detail?: string };
        };

        const code = err.code ?? err.driverError?.code;

        if (code === '23505') {
          throw new BadRequestException('Já existe um usuário com esse e-mail');
        }

        if ('message' in err && typeof err.message === 'string') {
          throw new BadRequestException(err.message || 'Erro ao criar usuário');
        }
      }

      if (error instanceof Error) {
        throw new BadRequestException(
          error?.message || 'Erro ao criar usuário',
        );
      }

      throw new BadRequestException('Erro ao criar usuário');
    }
  }

  async update(id: number, updateData: updateUserDTO): Promise<Partial<Users>> {
    try {
      const user: Users | null = await this.usersRepo.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const filteredUpdateData: Partial<Users> = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );

      if (filteredUpdateData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          filteredUpdateData.password,
          salt,
        );

        filteredUpdateData.password = hashedPassword;
      }

      Object.assign(user, filteredUpdateData);
      await this.usersRepo.update(id, filteredUpdateData);

      const result: Partial<Users> = { ...user };
      delete result.password;

      return result;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (typeof error === 'object' && error !== null) {
        const err = error as {
          code?: string;
          detail?: string;
          driverError?: { code?: string; detail?: string };
        };

        const code = err.code ?? err.driverError?.code;

        if (code === '23505') {
          throw new BadRequestException('Já existe um usuário com esse e-mail');
        }

        if ('message' in err && typeof err.message === 'string') {
          throw new BadRequestException(err.message || 'Erro ao criar usuário');
        }
      }

      if (error instanceof Error) {
        throw new BadRequestException(
          error?.message || 'Erro ao criar usuário',
        );
      }

      throw new BadRequestException('Erro ao atualizar usuário');
    }
  }

  async updatePassword(
    id: number,
    newPassword: string,
    currentPassword: string,
  ): Promise<void> {
    try {
      const user: Users | null = await this.usersRepo.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('Senha atual incorreta');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await this.usersRepo.update(id, user);

      return;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Erro ao atualizar senha');
    }
  }

  async findAll(): Promise<Users[]> {
    try {
      return await this.usersRepo.find();
    } catch (error: any) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error?.message || 'Erro ao buscar usuários',
        );
      }

      throw new InternalServerErrorException('Erro ao buscar usuários');
    }
  }

  async findOne(id: number): Promise<Partial<Users> | null> {
    try {
      const user = await this.usersRepo.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const result: Partial<Users> = { ...user };
      delete result.password;

      return result;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Erro ao buscar usuário');
    }
  }

  async findOneByEmail(email: string): Promise<Users | null> {
    try {
      const user = await this.usersRepo.findOneBy({ email });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return user;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Erro ao buscar usuário por e-mail');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.usersRepo.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      await this.usersRepo.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Erro ao deletar usuário');
    }
  }
}
