import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Users } from '../users.entity';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';
import { UserRole } from '../users.enums';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { expectToThrow } from 'src/helpers/test-exception';

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
    ],
  }).compile();
}

describe('UserService - integration', () => {
  const MOCK_CREATE_USER_DTO = {
    name: 'test',
    role: UserRole.USER,
    email: 'joao@email.com',
    password: '123',
  };

  let app: TestingModule;
  let userService: UsersService;
  let userRepository: Repository<Users>;
  let dataSource: DataSource;

  beforeEach(async () => {
    app = await createTestingModule();
    userService = app.get<UsersService>(UsersService);
    userRepository = app.get<Repository<Users>>(getRepositoryToken(Users));

    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  it('Should create an user', async () => {
    const createdUser = await userService.create(MOCK_CREATE_USER_DTO);

    const userInDb = await userRepository.findOneBy({
      email: MOCK_CREATE_USER_DTO.email,
    });

    const passwordIsMatched = await bcrypt.compare(
      MOCK_CREATE_USER_DTO.password,
      createdUser.password,
    );
    expect(passwordIsMatched).toBe(true);

    expect(createdUser).toBeDefined();
    expect(createdUser).toHaveProperty('id');
    expect(createdUser.email).toBe(MOCK_CREATE_USER_DTO.email);
    expect(createdUser.password).not.toEqual(MOCK_CREATE_USER_DTO.password);

    expect(userInDb).toBeDefined();
    expect(userInDb?.password).not.toBe(MOCK_CREATE_USER_DTO.password);
    expect(userInDb?.email).toEqual(MOCK_CREATE_USER_DTO.email);
  });

  it('Should thrown BadRequestException when there is an user with same email', async () => {
    await userService.create(MOCK_CREATE_USER_DTO);

    await expectToThrow({
      fn: () => userService.create(MOCK_CREATE_USER_DTO),
      expectedException: BadRequestException,
      expectedMessage: 'Já existe um usuário com esse e-mail',
      expectStatus: 400,
    });

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toHaveLength(1);
    expect(usersOnDb[0].email).toBe(MOCK_CREATE_USER_DTO.email);
  });
});
