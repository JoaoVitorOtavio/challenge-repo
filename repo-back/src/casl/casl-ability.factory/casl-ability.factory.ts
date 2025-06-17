import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Actions } from 'src/common/enums/actions.enum';
import { Users } from 'src/users/users.entity';
import { UserRole } from 'src/users/users.enums';

type Subjects = InferSubjects<typeof Users> | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: Users): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    switch (user.role) {
      case UserRole.ADMIN:
        can(Actions.Manage, 'all'); // pode tudo
        break;

      case UserRole.MANAGER:
        can(Actions.Read, Users); // pode ver todos os usuários
        can(Actions.ReadAll, Users); // pode ver lista de  todos os usuários
        can(Actions.Update, Users); // pode dar update em todos usuarios
        break;

      case UserRole.USER:
        // Por algum motivo as codintitions nao estao funcionando
        can(Actions.Read, Users, { id: user.id }); // pode ver o próprio perfil
        can(Actions.Update, Users, { id: user.id }); // pode editar só a si mesmo
        break;

      default:
        break;
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
