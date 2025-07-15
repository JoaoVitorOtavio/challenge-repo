import { Test } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Users } from '../users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersController } from '../http/users.controller';
import { AbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { UserRole } from '../users.enums';

let userController: UsersController;

const mockUsersRepo = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
} as Record<string, jest.Mock>;

const mockUsersService = {
  create: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  remove: jest.fn(),
};

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
      {
        provide: UsersService,
        useValue: mockUsersService,
      },
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

  userController = moduleRef.get<UsersController>(UsersController);
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe('UserController - Unit', () => {
  it('Should create an user successfully', async () => {
    const MOCK_CREATE_USER_BODY = {
      name: 'fake',
      email: 'fake@mail',
      password: 'fakepassword',
      role: UserRole.USER,
    };

    mockUsersService.create.mockResolvedValueOnce(MOCK_CREATE_USER_BODY);

    const result = await userController.create(MOCK_CREATE_USER_BODY);

    expect(result).toEqual(MOCK_CREATE_USER_BODY);
    expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    expect(mockUsersService.create).toHaveBeenCalledWith(MOCK_CREATE_USER_BODY);
  });

  it('Should update an user successfully', async () => {
    const updateUserProps = {
      id: 1,
      data: { name: 'fake name', email: 'fake@mail.com' },
    };

    const MOCK_CREATE_USER_BODY = {
      name: 'fake',
      email: 'fake@mail',
      role: UserRole.USER,
    };

    mockUsersService.update.mockResolvedValueOnce(MOCK_CREATE_USER_BODY);

    const result = await userController.update(
      updateUserProps.id,
      updateUserProps.data,
    );

    expect(result).toEqual(MOCK_CREATE_USER_BODY);
    expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    expect(mockUsersService.update).toHaveBeenCalledWith(
      updateUserProps.id,
      updateUserProps.data,
    );
  });

  it('Should updatePassword successfully', async () => {
    const updateUserProps = {
      id: 1,
      data: { newPassword: 'teste', currentPassword: 'fake' },
    };

    mockUsersService.updatePassword.mockResolvedValueOnce(null);

    const result = await userController.updatePassword(
      updateUserProps.id,
      updateUserProps.data,
    );

    expect(result).toBeUndefined();
    expect(mockUsersService.updatePassword).toHaveBeenCalledTimes(1);
    expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
      updateUserProps.id,
      updateUserProps.data.newPassword,
      updateUserProps.data.currentPassword,
    );
  });

  it('Should findAll SuccessFully', async () => {
    const MOCK_FIND_ALL_RESULT = [
      { id: 1, name: 'fake1', email: 'fake1@mail', role: UserRole.USER },
      { id: 2, name: 'fake2', email: 'fake2@mail', role: UserRole.USER },
      { id: 3, name: 'fake2', email: 'fake3@mail', role: UserRole.USER },
    ];
    mockUsersService.findAll.mockResolvedValueOnce(MOCK_FIND_ALL_RESULT);

    const result = await userController.findAll();

    expect(result).toBeDefined();
    expect(result).toEqual(MOCK_FIND_ALL_RESULT);

    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
  });
});
