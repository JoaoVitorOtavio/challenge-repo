import { AppAbility } from '../casl/casl-ability.factory/casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

export type PolicyHandler = IPolicyHandler | ((ability: AppAbility) => boolean);
