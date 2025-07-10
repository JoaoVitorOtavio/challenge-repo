import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { expectToThrow } from 'src/helpers/test-exception';
import { createUser } from 'src/helpers/test-create-user';
import { AuthService } from '../auth.service';
import { Users } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { UserRole } from 'src/users/users.enums';
import { MOCK_CREATE_USER_DTO } from 'src/users/tests/user.service.integration.spec';
import { AuthModule } from '../auth.module';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

export async function createTestingModule() {
  if (process.env.DB_NAME !== 'challenge-repo-test-db') {
    throw new Error('⚠️ Banco de PRODUÇÃO detectado! Abortando testes.');
  }

  return await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Users],
        migrations: [__dirname + '/../../database/migrations/*.{ts,js}'],
        migrationsRun: true,
        dropSchema: true,
        synchronize: false,
      }),
      UsersModule,
      AuthModule,
    ],
  }).compile();
}

describe('AuthService - integration', () => {
  let app: TestingModule;
  let authService: AuthService;
  let userRepository: Repository<Users>;
  let dataSource: DataSource;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    app = await createTestingModule();
    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);
    jwtService = app.get<JwtService>(JwtService);
    userRepository = app.get<Repository<Users>>(getRepositoryToken(Users));

    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  async function createAndCompareUserInfo(): Promise<{
    createdUser: Users;
    userInDb: Users | null;
    mockedPassword: string;
  }> {
    const createdUser = await userService.create(MOCK_CREATE_USER_DTO);
    expect(createdUser).toBeDefined();
    expect(createdUser).toHaveProperty('id');
    expect(createdUser.email).toBe(MOCK_CREATE_USER_DTO.email);
    expect(createdUser.password).not.toEqual(MOCK_CREATE_USER_DTO.password);

    const passwordIsMatched = await bcrypt.compare(
      MOCK_CREATE_USER_DTO.password,
      createdUser.password,
    );
    expect(passwordIsMatched).toBe(true);

    const userInDb = await userRepository.findOneBy({
      email: MOCK_CREATE_USER_DTO.email,
    });

    expect(userInDb).toBeDefined();
    expect(userInDb?.password).not.toBe(MOCK_CREATE_USER_DTO.password);
    expect(userInDb?.email).toEqual(createdUser.email);
    expect(userInDb?.name).toEqual(createdUser?.name);
    expect(userInDb?.id).toEqual(createdUser?.id);

    return {
      createdUser,
      userInDb,
      mockedPassword: MOCK_CREATE_USER_DTO.password,
    };
  }

  it('Should Login successfully', async () => {
    const { createdUser, mockedPassword } = await createAndCompareUserInfo();

    const loginResult = await authService.login({
      email: createdUser.email,
      password: mockedPassword,
    });

    expect(loginResult.token).toBeDefined();
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user.id).toEqual(createdUser.id);
    expect(loginResult.user.email).toEqual(createdUser.email);
    expect(loginResult.user.name).toEqual(createdUser.name);
    expect(loginResult.user.password).not.toBeDefined();

    const decoded: JwtPayload = jwtService.verify(loginResult.token);
    expect(decoded.email).toEqual(createdUser.email);
    expect(decoded.id).toEqual(createdUser.id);
  });
});
