import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { Users } from '../users.entity';
import {
  createUserDTO,
  updateUserDTO,
  UpdateUserPasswordDTO,
} from '../users.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { Actions } from 'src/common/enums/actions.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @CheckPolicies((ability: AppAbility) => ability.can(Actions.Create, Users))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @HttpCode(201)
  @Post()
  async create(@Body() data: createUserDTO): Promise<Users> {
    return this.usersService.create(data);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Actions.Update, Users))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @HttpCode(200)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: updateUserDTO,
  ): Promise<Partial<Users>> {
    return this.usersService.update(id, data);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Actions.Update, Users))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @Put(':id/password')
  @HttpCode(204)
  async updatePassword(
    @Param('id') id: number,
    @Body() data: UpdateUserPasswordDTO,
  ): Promise<void> {
    await this.usersService.updatePassword(
      id,
      data.newPassword,
      data.currentPassword,
    );

    return;
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Actions.ReadAll, Users))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @HttpCode(200)
  @Get()
  async findAll(): Promise<Users[]> {
    return this.usersService.findAll();
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Actions.Read, Users))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @HttpCode(200)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Partial<Users> | null> {
    return this.usersService.findOne(id);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Actions.Delete, Users))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
