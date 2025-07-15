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

    mockUsersService.create.mockResolvedValue(MOCK_CREATE_USER_BODY);

    const result = await userController.create(MOCK_CREATE_USER_BODY);

    expect(result).toEqual(MOCK_CREATE_USER_BODY);
    expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    expect(mockUsersService.create).toHaveBeenCalledWith(MOCK_CREATE_USER_BODY);
  });
});
