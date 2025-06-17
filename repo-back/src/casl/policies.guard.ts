import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY } from './policy.decorator';
import { PolicyHandler } from 'src/common/types';
import { Users } from 'src/users/users.entity';
import {
  AbilityFactory,
  AppAbility,
} from './casl-ability.factory/casl-ability.factory';

export interface RequestWithUser extends Request {
  user: Users;
}

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: Users = request.user;

    const ability: AppAbility = this.abilityFactory.defineAbility(user);

    const isAllowed = handlers.every((handler) =>
      typeof handler === 'function'
        ? handler(ability)
        : handler.handle(ability),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
