import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Users } from '../users.entity';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';
import { UserRole } from '../users.enums';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
  let app: TestingModule;
  let userService: UsersService;
  let userRepository: Repository<Users>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestingModule();
    userService = app.get<UsersService>(UsersService);
    userRepository = app.get<Repository<Users>>(getRepositoryToken(Users));

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  it('Should create an user', async () => {
    const dto = {
      name: 'test',
      role: UserRole.USER,
      email: 'joao@email.com',
      password: '123',
    };

    const createdUser = await userService.create(dto);

    const userInDb = await userRepository.findOneBy({ email: dto.email });

    const isMatch = await bcrypt.compare(dto.password, createdUser.password);
    expect(isMatch).toBe(true);

    expect(createdUser).toBeDefined();
    expect(createdUser).toHaveProperty('id');
    expect(createdUser.email).toBe(dto.email);
    expect(createdUser.password).not.toEqual(dto.password);

    expect(userInDb).toBeDefined();
    expect(userInDb?.password).not.toBe(dto.password);
    expect(userInDb?.email).toEqual(dto.email);
  });
});
