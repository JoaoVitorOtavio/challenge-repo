import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';
import { AuthController } from '../auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/users/users.enums';
import { expectToThrow } from 'src/helpers/test-exception';
import { UnauthorizedException } from '@nestjs/common';

let authService: AuthService;
let usersService: UsersService;

const MOCK_RESULT = {
  id: 1,
  name: 'mockedUser',
  email: 'mockuser@mail.com',
  password: '123',
  role: UserRole.USER,
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
};

const mockUsersRepo = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
} as Record<string, jest.Mock>;

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

jest.mock('bcrypt');

const mockBcrypt = {
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
};

const MOCK_HASH_PASSWORD = 'hashedPassword';
const MOCK_SALT = 'mockedSalt';
const MOCK_JWT_SIGN_TOKEN = 'mocked-token';

(bcrypt.compare as jest.Mock) = mockBcrypt.compare;
(bcrypt.genSalt as jest.Mock) = mockBcrypt.genSalt;
(bcrypt.hash as jest.Mock) = mockBcrypt.hash;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      AuthService,
      {
        provide: UsersService,
        useValue: mockUsersService,
      },
      {
        provide: getRepositoryToken(Users),
        useValue: mockUsersRepo,
      },
      {
        provide: JwtService,
        useValue: mockJwtService,
      },
    ],
  }).compile();

  authService = moduleRef.get(AuthService);
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe('AuthService', () => {
  it('Should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('Should login successfully', async () => {
    mockUsersService.findOneByEmail.mockResolvedValueOnce(MOCK_RESULT);
    mockBcrypt.compare.mockResolvedValueOnce(true);
    mockJwtService.sign.mockReturnValueOnce(MOCK_JWT_SIGN_TOKEN);

    const result = await authService.login({
      email: MOCK_RESULT.email,
      password: MOCK_RESULT.password,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result.token).toBe(MOCK_JWT_SIGN_TOKEN);
    expect(result.user).not.toHaveProperty('password');
    expect(result.user).toMatchObject({
      id: MOCK_RESULT.id,
      name: MOCK_RESULT.name,
      email: MOCK_RESULT.email,
      role: MOCK_RESULT.role,
    });

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      MOCK_RESULT.email,
    );

    expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      MOCK_RESULT.password,
      MOCK_RESULT.password,
    );
  });

  it('Should throw UnauthorizedException when user is not founded', async () => {
    mockUsersService.findOneByEmail.mockResolvedValueOnce(null);

    await expectToThrow({
      fn: () =>
        authService.login({
          email: MOCK_RESULT.email,
          password: MOCK_RESULT.password,
        }),
      expectedException: UnauthorizedException,
      expectedMessage: 'Usuário não encontrado.',
    });

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      MOCK_RESULT.email,
    );

    expect(mockBcrypt.compare).toHaveBeenCalledTimes(0);
  });
});
