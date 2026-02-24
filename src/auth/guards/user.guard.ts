import { applyDecorators, CanActivate, ExecutionContext, Injectable, SetMetadata, UseGuards } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRolesEnum } from "src/users/models/enums/user-roles.enum";

const ROLE_METADATA_KEY = 'requiredRoleName';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoleName = this.reflector.getAllAndOverride<string>(
      ROLE_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );

    console.log(`Precisa ser ${requiredRoleName}`);

    return true;
  }
}

export function UseUserGuard(roleName?: UserRolesEnum) {
  return applyDecorators(
    SetMetadata(ROLE_METADATA_KEY, roleName),
    UseGuards(UserGuard)
  )
}