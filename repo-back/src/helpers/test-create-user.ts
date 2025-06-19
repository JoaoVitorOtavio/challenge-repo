import { MOCK_CREATE_USER_DTO } from 'src/users/tests/user.service.integration.spec';
import { Users } from 'src/users/users.entity';
import { UserRole } from 'src/users/users.enums';
import { UsersService } from 'src/users/users.service';

interface CreateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export async function createUser(
  userService: UsersService,
  overrides: CreateUserInput = {},
): Promise<Users> {
  const userData = { ...MOCK_CREATE_USER_DTO, ...overrides };

  return await userService.create(userData);
}
