import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Users } from '../users.entity';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';
import { UserRole } from '../users.enums';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
  email: 'fake@email.com',
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

  it('Should throw NotFoundException when user not found on update', async () => {
    await expectToThrow({
      fn: () => userService.update(1, { name: 'fake name' }),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });

    const users = await userRepository.find();
    expect(users).toHaveLength(0);
  });

  it('Should throw BadRequestException when try to update to an existed email on update', async () => {
    const MOCK_USER_EMAIL = 'fake2@mail.com';

    const firstUserInDb = await createUser(userService);
    expect(firstUserInDb).toBeDefined();
    expect(firstUserInDb.email).toBe(MOCK_CREATE_USER_DTO.email);

    const createdUser = await createUser(userService, {
      email: MOCK_USER_EMAIL,
    });
    expect(createdUser).toHaveProperty('id');

    await expectToThrow({
      fn: () =>
        userService.update(createdUser.id, {
          email: MOCK_CREATE_USER_DTO.email,
        }),
      expectedException: BadRequestException,
      expectedMessage: 'Já existe um usuário com esse e-mail',
    });

    const userInDb = await userRepository.findOneBy({
      id: createdUser.id,
    });

    expect(userInDb).toBeDefined();
    expect(userInDb!.email).toBe(createdUser.email);

    const allUsers = await userRepository.find();
    expect(allUsers).toHaveLength(2);
  });

  it('Should throw BadRequestException when try to update an user and pass nothing on update', async () => {
    const createdUser = await createUser(userService);
    expect(createdUser).toHaveProperty('id');

    await expectToThrow({
      fn: () => userService.update(createdUser.id, {}),
      expectedException: BadRequestException,
      expectedMessage:
        'É necessário informar ao menos um campo para atualizar.',
    });

    const userInDb = await userRepository.findOneBy({
      id: createdUser.id,
    });

    expect(userInDb).toBeDefined();
    expect(userInDb!.email).toBe(createdUser.email);
    expect(userInDb!.name).toBe(createdUser.name);

    const usersInDb = await userRepository.find();
    expect(usersInDb).toHaveLength(1);
  });

  it('Should update password correctly', async () => {
    const NEW_PASSWORD = 'newpassword';

    const createdUser = await createUser(userService);
    expect(createdUser).toHaveProperty('id');

    const passwordIsMatchedOnCreated = await bcrypt.compare(
      MOCK_CREATE_USER_DTO.password,
      createdUser.password,
    );
    expect(passwordIsMatchedOnCreated).toBe(true);

    await userService.updatePassword(
      createdUser.id,
      NEW_PASSWORD,
      MOCK_CREATE_USER_DTO.password,
    );

    const userInDb = await userRepository.findOneBy({
      id: createdUser.id,
    });
    expect(userInDb).toBeDefined();
    expect(userInDb!.email).toBe(createdUser.email);
    expect(userInDb!.name).toBe(createdUser.name);

    const passwordIsMatchedOnUpdated = await bcrypt.compare(
      NEW_PASSWORD,
      userInDb!.password,
    );
    expect(passwordIsMatchedOnUpdated).toBe(true);

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toHaveLength(1);
  });

  it('Should return BadRequestException when user is not found on updatePassword', async () => {
    const createdUser = await createUser(userService);
    expect(createdUser).toHaveProperty('id');

    await expectToThrow({
      fn: () =>
        userService.updatePassword(
          createdUser.id + 1,
          'NEW_PASSWORD',
          MOCK_CREATE_USER_DTO.password,
        ),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });

    expect(createdUser.email).toEqual(MOCK_CREATE_USER_DTO.email);
    expect(createdUser.name).toEqual(MOCK_CREATE_USER_DTO.name);

    const passwordIsMatched = await bcrypt.compare(
      MOCK_CREATE_USER_DTO.password,
      createdUser.password,
    );
    expect(passwordIsMatched).toBe(true);

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toHaveLength(1);
  });

  it('Should return BadRequestException when passwords does not match on update password', async () => {
    const createdUser = await createUser(userService);
    expect(createdUser).toHaveProperty('id');

    await expectToThrow({
      fn: () =>
        userService.updatePassword(
          createdUser.id,
          'NEW_PASSWORD',
          'wrong password',
        ),
      expectedException: BadRequestException,
      expectedMessage: 'Senha atual incorreta',
    });

    const userOnDb = await userRepository.findOneBy({ id: createdUser.id });

    expect(userOnDb).toBeDefined();
    expect(userOnDb?.email).toEqual(MOCK_CREATE_USER_DTO.email);
    expect(userOnDb?.name).toEqual(MOCK_CREATE_USER_DTO.name);

    const passwordIsMatched = await bcrypt.compare(
      MOCK_CREATE_USER_DTO.password,
      userOnDb!.password,
    );
    expect(passwordIsMatched).toBe(true);

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toHaveLength(1);
  });

  it('Should return all users on findAll', async () => {
    for (let i = 0; i < 3; i++) {
      await createUser(userService, {
        email: `teste${i}@mail.com`,
      });
    }

    const users = await userService.findAll();
    expect(users).toBeDefined();
    expect(users).toHaveLength(3);

    const emails = users.map((user) => user.email);
    expect(emails).toEqual(
      expect.arrayContaining([
        'teste0@mail.com',
        'teste1@mail.com',
        'teste2@mail.com',
      ]),
    );

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toBeDefined();
    expect(usersOnDb).toHaveLength(3);
  });

  it('Should find One User', async () => {
    const createdUser = await createUser(userService);
    expect(createdUser).toBeDefined();

    const foundUser = await userService.findOne(createdUser.id);

    expect(foundUser).toBeDefined();
    expect(createdUser.email).toEqual(foundUser?.email);
    expect(createdUser.name).toEqual(foundUser?.name);
    expect(foundUser?.password).toBeUndefined();

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toBeDefined();
    expect(usersOnDb).toHaveLength(1);
  });

  it('Should return NotFoundExpection when a user is not found on find One', async () => {
    await expectToThrow({
      fn: () => userService.findOne(1),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });
  });

  it('Should find one user by email', async () => {
    const createdUser = await createUser(userService);
    expect(createdUser).toBeDefined();

    const foundUser = await userService.findOneByEmail(createdUser.email);

    expect(foundUser).toBeDefined();
    expect(createdUser.email).toEqual(foundUser?.email);
    expect(createdUser.name).toEqual(foundUser?.name);

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toBeDefined();
    expect(usersOnDb).toHaveLength(1);
  });

  it('Should return NotFoundExpection when user is not found on findOneByEmail', async () => {
    await expectToThrow({
      fn: () => userService.findOne(1),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });
  });

  it('Should remove an user', async () => {
    const createdUser = await createUser(userService);
    expect(createdUser).toBeDefined();

    await userService.remove(createdUser.id);

    const usersOnDb = await userRepository.find();
    expect(usersOnDb).toBeDefined();
    expect(usersOnDb).toHaveLength(0);
  });

  it('Should return NotFoundException when user is not found on remove', async () => {
    await expectToThrow({
      fn: () => userService.remove(1),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });
  });
});
