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
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

let authService: AuthService;

const MOCK_RESULT = {
  id: 1,
  name: 'mockedUser',
  email: 'mockuser@mail.com',
  password: '123',
  role: UserRole.USER,
};

const MOCK_USER = {
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

const MOCK_JWT_SIGN_TOKEN = 'mocked-token';
const MOCK_JWT_CODE = 'JWTCODE';

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
      email: MOCK_USER.email,
      password: MOCK_USER.password,
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
      MOCK_USER.email,
    );

    expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      MOCK_USER.password,
      MOCK_RESULT.password,
    );
  });

  it('Should throw NotFoundException when user is not founded on Login', async () => {
    mockUsersService.findOneByEmail.mockResolvedValueOnce(null);

    await expectToThrow({
      fn: () =>
        authService.login({
          email: MOCK_USER.email,
          password: MOCK_USER.password,
        }),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado.',
    });

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      MOCK_USER.email,
    );

    expect(mockBcrypt.compare).toHaveBeenCalledTimes(0);
  });

  it('Should throw UnauthorizedException when password is not correctly on Login', async () => {
    mockUsersService.findOneByEmail.mockResolvedValueOnce(MOCK_RESULT);
    mockBcrypt.compare.mockResolvedValueOnce(false);

    await expectToThrow({
      fn: () =>
        authService.login({
          email: MOCK_USER.email,
          password: MOCK_USER.password,
        }),
      expectedException: UnauthorizedException,
      expectedMessage: 'Senha incorreta.',
    });

    expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      MOCK_USER.password,
      MOCK_RESULT.password,
    );

    expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
  });

  it('Should login with JWT successfully', async () => {
    mockUsersService.findOneByEmail.mockResolvedValueOnce(MOCK_RESULT);
    mockJwtService.verify.mockReturnValue(MOCK_RESULT);
    mockJwtService.sign.mockReturnValue(MOCK_JWT_CODE);

    const { password: _, ...mockWithoutPassword } = MOCK_RESULT;

    const result = await authService.loginWithJwt(MOCK_JWT_CODE);

    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user.password).not.toBeDefined();

    expect(mockJwtService.verify).toHaveBeenCalledTimes(1);
    expect(mockJwtService.verify).toHaveBeenCalledWith(MOCK_JWT_CODE);

    expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    expect(mockJwtService.sign).toHaveBeenCalledWith(mockWithoutPassword);

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      MOCK_RESULT.email,
    );
  });

  it('Should throw UnauthorizedException when the token is invalid on loginWithJwt', async () => {
    mockJwtService.verify.mockReturnValue(undefined);

    await expectToThrow({
      fn: () => authService.loginWithJwt(MOCK_JWT_CODE),
      expectedException: UnauthorizedException,
      expectedMessage: 'Token inválido',
    });

    expect(mockJwtService.verify).toHaveBeenCalledTimes(1);
    expect(mockJwtService.verify).toHaveBeenCalledWith(MOCK_JWT_CODE);
  });

  it('Should throw NotFoundException when user is not founded on loginWithJwt', async () => {
    mockUsersService.findOneByEmail.mockResolvedValueOnce(undefined);
    mockJwtService.verify.mockReturnValue(MOCK_RESULT);

    await expectToThrow({
      fn: () => authService.loginWithJwt(MOCK_JWT_CODE),
      expectedException: NotFoundException,
      expectedMessage: 'Usuário não encontrado',
    });

    expect(mockJwtService.verify).toHaveBeenCalledTimes(1);
    expect(mockJwtService.verify).toHaveBeenCalledWith(MOCK_JWT_CODE);

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      MOCK_RESULT.email,
    );
  });
});
