import { applyDecorators, CanActivate, ExecutionContext, Injectable, SetMetadata, UseGuards } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

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

    return true;
  }
}

export function UseUserGuard(roleName?: string) {
  return applyDecorators(
    SetMetadata(ROLE_METADATA_KEY, roleName),
    UseGuards(UserGuard)
  )
}