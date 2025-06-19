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
import { createUser } from 'src/helpers/test-create-user';

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

export const MOCK_CREATE_USER_DTO = {
  name: 'test',
  role: UserRole.USER,
  email: 'joao@email.com',
  password: '123',
};

describe('UserService - integration', () => {
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

  it('Should be possible to create an user without pass role property', async () => {
    const createdUser = await userService.create({
      ...MOCK_CREATE_USER_DTO,
      role: undefined,
    });

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

  it('Should update an user properly', async () => {
    const MOCK_NEW_NAME = 'fake update name';
    const MOCK_NEW_PASSWORD = 'fake update password';

    const createdUser = await createUser(userService);
    expect(createdUser).toHaveProperty('id');

    const updatedUser = await userService.update(createdUser.id, {
      name: MOCK_NEW_NAME,
      password: MOCK_NEW_PASSWORD,
    });
    expect(createdUser.name).not.toEqual(updatedUser.name);
    expect(updatedUser.name).toEqual(MOCK_NEW_NAME);
    expect(updatedUser.id).toEqual(createdUser.id);
    expect(updatedUser).not.toHaveProperty('password');

    const userInDb = await userRepository.findOneBy({
      id: updatedUser.id,
    });
    expect(userInDb).toBeDefined();
    expect(userInDb!.email).toBe(createdUser.email);

    const passwordIsMatched = await bcrypt.compare(
      MOCK_NEW_PASSWORD,
      userInDb!.password,
    );
    expect(passwordIsMatched).toBe(true);
  });
});
