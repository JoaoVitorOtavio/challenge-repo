import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';
import { AuthController } from '../auth.controller';
import { JwtService } from '@nestjs/jwt';

let authService: AuthService;

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
    controllers: [AuthController],
    providers: [
      AuthService,
      UsersService,
      {
        provide: getRepositoryToken(Users),
        useValue: mockUsersRepo,
      },
      {
        provide: JwtService,
        useValue: {
          sign: jest.fn(),
          verify: jest.fn(),
        },
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
});
