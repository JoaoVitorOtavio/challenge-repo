import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from './users.enums';

export class UserDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsEmail(
    {},
    { message: 'E-mail inválido. Informe um endereço de e-mail válido.' },
  )
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsEnum(UserRole, {
    message: 'Invalid type on role',
  })
  @IsOptional() // é opicional pq tem default pra cadastrar no banco
  role: UserRole;
}

export class updateUserDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsEmail(
    {},
    { message: 'E-mail inválido. Informe um endereço de e-mail válido.' },
  )
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsEnum(UserRole, {
    message: 'Invalid type on role',
  })
  @IsOptional() // é opicional pq tem default pra cadastrar no banco
  role: UserRole;
}

export class UpdateUserPasswordDTO {
  @IsString()
  @IsNotEmpty({ message: 'A nova senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha atual não pode estar vazia' })
  currentPassword: string;
}

export class createUserDTO {
  @IsString()
  name: string;

  @IsEmail(
    {},
    { message: 'E-mail inválido. Informe um endereço de e-mail válido.' },
  )
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsEnum(UserRole, {
    message: 'role deve ser admin, user ou internal',
  })
  @IsOptional() // é opicional pq tem default pra cadastrar no banco
  role: UserRole;
}
