import { Test } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Users } from '../users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersController } from '../http/users.controller';
import { AbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { UserRole } from '../users.enums';
import { expectToThrow } from 'src/helpers/test-exception';
import { updateUserDTO } from '../users.dto';

let usersService: UsersService;
const MOCK_EMAIL = 'email@fake';
const MOCK_RESULT = {
  id: 1,
  name: 'mockedUser',
  password: '123',
};

const MOCK_UPDATE_PASSWORD_BODY = {
  id: 1,
  newPassword: 'new',
  currentPassword: 'current',
};

const MOCK_UPDATE_USER_BODY = {
  name: 'fake',
  email: 'fake@mail',
  password: 'fakepassword',
  role: UserRole.USER,
};

const MOCK_HASH_PASSWORD = 'hashedPassword';
const MOCK_SALT = 'mockedSalt';

const mockUsersRepo = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
} as Record<string, jest.Mock>;

jest.mock('bcrypt');

const mockBcrypt = {
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
};

(bcrypt.compare as jest.Mock) = mockBcrypt.compare;
(bcrypt.genSalt as jest.Mock) = mockBcrypt.genSalt;
(bcrypt.hash as jest.Mock) = mockBcrypt.hash;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    controllers: [UsersController],
    providers: [
      UsersService,
      {
        provide: getRepositoryToken(Users),
        useValue: mockUsersRepo,
      },
      {
        provide: AbilityFactory,
        useValue: {
          defineAbility: jest.fn(),
        },
      },
    ],
  }).compile();

  usersService = moduleRef.get(UsersService);
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe('UserService', () => {
  it('Should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('Should find All Users', async () => {
    mockUsersRepo.find.mockResolvedValueOnce([]);

    const result = await usersService.findAll();

    expect(mockUsersRepo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should throw InternalServerErrorException when there is an error on findAll', async () => {
    mockUsersRepo.find.mockRejectedValueOnce(
      new InternalServerErrorException(),
    );

    await expect(usersService.findAll()).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(mockUsersRepo.find).toHaveBeenCalledTimes(1);
  });

  it("Should return notFoundException when user doesn't exist on remove", async () => {
    mockUsersRepo.findOneBy.mockResolvedValueOnce(undefined);

    await expectToThrow({
      fn: () => usersService.remove(1),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });

    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.delete).not.toHaveBeenCalled();
  });

  it('Should return badRequestException when there is an error on remove', async () => {
    mockUsersRepo.findOneBy.mockRejectedValueOnce(new BadRequestException());

    await expect(usersService.remove(1)).rejects.toThrow(BadRequestException);
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.delete).not.toHaveBeenCalled();
  });

  it('Should remove an user', async () => {
    mockUsersRepo.findOneBy.mockResolvedValueOnce({
      id: 1,
      name: 'mockedUser',
    });

    mockUsersRepo.delete.mockResolvedValueOnce(undefined);

    const result = await usersService.remove(1);

    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.delete).toHaveBeenCalledWith(1);
    expect(mockUsersRepo.delete).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });

  it('Should find a user by email', async () => {
    mockUsersRepo.findOneBy.mockResolvedValueOnce(MOCK_RESULT);

    const result = await usersService.findOneByEmail(MOCK_EMAIL);

    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ email: MOCK_EMAIL });
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_RESULT);
  });

  it('Should throw notFoundException when user doesnt exist on find user by email', async () => {
    mockUsersRepo.findOneBy.mockResolvedValueOnce(undefined);

    await expectToThrow({
      fn: () => usersService.findOneByEmail(MOCK_EMAIL),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
      shouldForceFail: true,
    });

    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ email: MOCK_EMAIL });
  });

  it('Should throw badRequestException when there is an error on find user by email', async () => {
    mockUsersRepo.findOneBy.mockRejectedValueOnce(new BadRequestException());

    await expect(usersService.findOneByEmail(MOCK_EMAIL)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ email: MOCK_EMAIL });
  });

  it('Should find a user by id', async () => {
    mockUsersRepo.findOneBy.mockResolvedValueOnce(MOCK_RESULT);

    const result = await usersService.findOne(MOCK_RESULT.id);

    expect(result).toEqual({
      id: MOCK_RESULT.id,
      name: MOCK_RESULT.name,
    });
    expect(result).not.toHaveProperty('password');
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(MOCK_RESULT.id);
    expect(mockUsersRepo.findOneBy).toHaveBeenLastCalledWith({ id: 1 });
  });

  it('Should throw notFoundException when user doesnt exist on find user by id', async () => {
    mockUsersRepo.findOneBy.mockResolvedValueOnce(undefined);

    await expectToThrow({
      fn: () => usersService.findOne(MOCK_RESULT.id),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
      shouldForceFail: true,
    });

    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({
      id: MOCK_RESULT.id,
    });
  });

  it('Should throw BadRequestException when there is an error on find user by id', async () => {
    mockUsersRepo.findOneBy.mockRejectedValueOnce(new BadRequestException());

    await expect(usersService.findOne(MOCK_RESULT.id)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockUsersRepo.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOneBy).toHaveBeenLastCalledWith({
      id: MOCK_RESULT.id,
    });
  });

  it('Should return badRequestException if current password is incorrect', async () => {
    mockBcrypt.compare.mockResolvedValue(false);
    mockUsersRepo.findOne.mockResolvedValueOnce(MOCK_RESULT);

    const { id, newPassword, currentPassword } = MOCK_UPDATE_PASSWORD_BODY;

    await expectToThrow({
      fn: () => usersService.updatePassword(id, newPassword, currentPassword),
      expectedException: BadRequestException,
      expectedMessage: 'Senha atual incorreta',
    });

    expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
      where: { id: MOCK_UPDATE_PASSWORD_BODY.id },
    });
    expect(mockUsersRepo.update).not.toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      MOCK_UPDATE_PASSWORD_BODY.currentPassword,
      MOCK_RESULT.password,
    );
  });

  it('Should return notFoundExeption when user not found on update password', async () => {
    mockUsersRepo.findOne.mockResolvedValueOnce(undefined);

    const { id, newPassword, currentPassword } = MOCK_UPDATE_PASSWORD_BODY;

    await expectToThrow({
      fn: () => usersService.updatePassword(id, newPassword, currentPassword),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
      shouldForceFail: true,
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(mockUsersRepo.update).not.toHaveBeenCalled();
    expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(1);
  });

  it('Should update password correctly', async () => {
    const CLONE_MOCK_PASSWORD = MOCK_RESULT.password;

    mockUsersRepo.findOne.mockResolvedValueOnce(MOCK_RESULT);
    mockBcrypt.compare.mockResolvedValueOnce(true);
    mockBcrypt.genSalt.mockResolvedValueOnce(MOCK_SALT);
    mockBcrypt.hash.mockResolvedValueOnce(MOCK_HASH_PASSWORD);

    const { id, newPassword, currentPassword } = MOCK_UPDATE_PASSWORD_BODY;
    await usersService.updatePassword(id, newPassword, currentPassword);

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      currentPassword,
      CLONE_MOCK_PASSWORD,
    );
    expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, MOCK_SALT);

    expect(mockUsersRepo.update).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.update).toHaveBeenCalledWith(1, {
      ...MOCK_RESULT,
      password: MOCK_HASH_PASSWORD,
    });
  });

  it('Should return BadRequestException with custom message when try to update user with an email already existent', async () => {
    const error = new Error('fake detail') as {
      code?: string;
      detail?: string;
      driverError?: { code?: string; detail?: string };
    };

    error.code = '23505';
    error.detail = 'fake detail';
    error.driverError = { code: '23505', detail: 'fake detail' };

    mockUsersRepo.findOne.mockResolvedValueOnce(MOCK_RESULT);
    mockUsersRepo.update.mockRejectedValueOnce(error);

    mockBcrypt.genSalt.mockResolvedValueOnce(MOCK_SALT);
    mockBcrypt.hash.mockResolvedValueOnce(MOCK_HASH_PASSWORD);

    await expectToThrow({
      fn: () => usersService.update(MOCK_RESULT.id, MOCK_UPDATE_USER_BODY),
      expectedException: BadRequestException,
      expectedMessage: 'Já existe um usuário com esse e-mail',
    });

    expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith(
      MOCK_UPDATE_USER_BODY.password,
      MOCK_SALT,
    );

    expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.update).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.update).toHaveBeenLastCalledWith(MOCK_RESULT.id, {
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
  });

  it('Should return NotFoundException when user is not found on update', async () => {
    mockUsersRepo.findOne.mockResolvedValueOnce(null);

    await expectToThrow({
      fn: () => usersService.update(MOCK_RESULT.id, MOCK_UPDATE_USER_BODY),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });

    expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.update).not.toHaveBeenCalled();
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUsersRepo.findOne).toHaveBeenLastCalledWith({
      where: { id: MOCK_RESULT.id },
    });
  });

  it('Should update user correctly', async () => {
    mockUsersRepo.findOne.mockResolvedValueOnce(MOCK_RESULT);
    mockBcrypt.genSalt.mockResolvedValueOnce(MOCK_SALT);
    mockBcrypt.hash.mockResolvedValueOnce(MOCK_HASH_PASSWORD);
    mockUsersRepo.update.mockResolvedValueOnce(MOCK_UPDATE_USER_BODY);

    await usersService.update(MOCK_RESULT.id, MOCK_UPDATE_USER_BODY);

    expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
      where: { id: MOCK_RESULT.id },
    });

    expect(mockBcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);

    expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.hash).toHaveBeenCalledWith(
      MOCK_UPDATE_USER_BODY.password,
      MOCK_SALT,
    );

    expect(mockUsersRepo.update).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.update).toHaveBeenCalledWith(MOCK_RESULT.id, {
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
  });

  it('Should update user correctly when dont have password', async () => {
    mockUsersRepo.findOne.mockResolvedValueOnce(MOCK_RESULT);

    const MOCK_UPDATE_BODY = {
      name: MOCK_UPDATE_USER_BODY.name,
      email: MOCK_UPDATE_USER_BODY.email,
    } as updateUserDTO;

    await usersService.update(MOCK_RESULT.id, MOCK_UPDATE_BODY);

    expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
      where: { id: MOCK_RESULT.id },
    });

    expect(mockBcrypt.genSalt).not.toHaveBeenCalled();
    expect(mockBcrypt.hash).not.toHaveBeenCalled();

    expect(mockUsersRepo.update).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.update).toHaveBeenCalledWith(
      MOCK_RESULT.id,
      MOCK_UPDATE_BODY,
    );
  });

  it('Should return badRequestException when email is already in use', async () => {
    const CLONE_MOCK_PASSWORD = MOCK_UPDATE_USER_BODY.password;

    const error = new Error('fake detail') as {
      code?: string;
      detail?: string;
      driverError?: { code?: string; detail?: string };
    };

    error.code = '23505';
    error.detail = 'fake detail';
    error.driverError = { code: '23505', detail: 'fake detail' };

    mockBcrypt.genSalt.mockResolvedValueOnce(MOCK_SALT);
    mockBcrypt.hash.mockResolvedValueOnce(MOCK_HASH_PASSWORD);

    mockUsersRepo.create.mockReturnValueOnce({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
    mockUsersRepo.save.mockRejectedValueOnce(error);

    await expectToThrow({
      fn: () => usersService.create(MOCK_UPDATE_USER_BODY),
      expectedException: BadRequestException,
      expectedMessage: 'Já existe um usuário com esse e-mail',
    });

    expect(mockBcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);

    expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.hash).toHaveBeenCalledWith(
      CLONE_MOCK_PASSWORD,
      MOCK_SALT,
    );

    expect(mockUsersRepo.save).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.save).toHaveBeenCalledWith({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
  });

  it('Should return badRequestException when there is an error', async () => {
    const CLONE_MOCK_PASSWORD = MOCK_UPDATE_USER_BODY.password;

    mockBcrypt.genSalt.mockResolvedValueOnce(MOCK_SALT);
    mockBcrypt.hash.mockResolvedValueOnce(MOCK_HASH_PASSWORD);

    mockUsersRepo.create.mockReturnValueOnce({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
    mockUsersRepo.save.mockRejectedValueOnce(new BadRequestException());

    await expectToThrow({
      fn: () => usersService.create(MOCK_UPDATE_USER_BODY),
      expectedException: BadRequestException,
      expectedMessage: 'Bad Request',
      shouldForceFail: true,
    });

    expect(mockBcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);

    expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.hash).toHaveBeenCalledWith(
      CLONE_MOCK_PASSWORD,
      MOCK_SALT,
    );

    expect(mockUsersRepo.save).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.save).toHaveBeenCalledWith({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
  });

  it('Should create user correctly', async () => {
    mockBcrypt.genSalt.mockResolvedValueOnce(MOCK_SALT);
    mockBcrypt.hash.mockResolvedValueOnce(MOCK_HASH_PASSWORD);

    mockUsersRepo.create.mockReturnValueOnce({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
    mockUsersRepo.save.mockResolvedValueOnce({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });

    const result = await usersService.create(MOCK_UPDATE_USER_BODY);

    expect(mockBcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);

    expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.hash).toHaveBeenCalledWith(
      MOCK_UPDATE_USER_BODY.password,
      MOCK_SALT,
    );

    expect(mockUsersRepo.create).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.create).toHaveBeenCalledWith({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });

    expect(mockUsersRepo.save).toHaveBeenCalledTimes(1);
    expect(mockUsersRepo.save).toHaveBeenCalledWith({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });

    expect(result).toEqual({
      ...MOCK_UPDATE_USER_BODY,
      password: MOCK_HASH_PASSWORD,
    });
  });
});
