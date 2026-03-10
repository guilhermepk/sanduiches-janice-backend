import { applyDecorators, CanActivate, ExecutionContext, HttpException, Injectable, InternalServerErrorException, NotFoundException, SetMetadata, UnauthorizedException, UseGuards } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { Reflector } from "@nestjs/core";
import { tryCatch } from "src/common/utils/try-catch.util";
import { UserRolesEnum } from "src/users/models/enums/user-roles.enum";
import { Request, Response } from "express";
import { UserJwtPayload, UserJwtPayloadScheme } from "../models/types/user-jwt-payload.type";
import { DecodeJwtTokenUseCase } from "../use-cases/decode-jwt-token/decode-jwt-token.use-case";
import { ACCESS_TOKEN_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY } from "../auth.constants";
import { FindUserByIdUseCase } from "src/users/use-cases/find-by-id/find-user-by-id.use-case";
import { UserEntity } from "src/users/models/entities/user.entity";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConfigTokenCookiesUseCase } from "../use-cases/config-token-cookies/config-token-cookies.use-case";
import { GenerateJwtTokensUseCase } from "../use-cases/generate-jwt-tokens/generate-jwt-tokens.use-case";
import { UnauthorizedReasonsEnum } from "../models/enums/unauthorized-reasons.enum";

const ROLE_METADATA_KEY = 'requiredRole';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly decodeJwtTokenUseCase: DecodeJwtTokenUseCase,
    private readonly jwtService: JwtService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly configService: ConfigService,
    private readonly configTokenCookiesUseCase: ConfigTokenCookiesUseCase,
    private readonly generateJwtTokensUseCase: GenerateJwtTokensUseCase
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return await tryCatch(async () => {
      const requiredRole = this.reflector.getAllAndOverride<string>(
        ROLE_METADATA_KEY,
        [context.getHandler(), context.getClass()]
      );

      const httpContext: HttpArgumentsHost = context.switchToHttp();

      const request: Request = httpContext.getRequest();
      const response: Response = httpContext.getResponse();

      console.log(`request.cookies`, JSON.stringify(request.cookies));

      const accessToken: string | undefined = request.cookies[ACCESS_TOKEN_COOKIE_KEY];
      if (!accessToken) throw new UnauthorizedException(`Credenciais inválidas (${UnauthorizedReasonsEnum.ACCESS_TOKEN_ABSENCE})`);

      const refreshToken: string | undefined = request.cookies[REFRESH_TOKEN_COOKIE_KEY];

      const decodedAccessToken: UserJwtPayload = await this.decodeJwtTokenUseCase.execute<UserJwtPayload>(accessToken, UserJwtPayloadScheme);

      const user: UserEntity = await this.findUser(decodedAccessToken.id);

      if (user.role !== requiredRole) throw new UnauthorizedException(`Cargo incompatível. Você não tem autorização para executar essa ação. (${UnauthorizedReasonsEnum.MISSING_PRIVILLEGES})`);

      await this.jwtService.verifyAsync<UserJwtPayload>(accessToken, { secret: this.configService.get('ACCESS_TOKEN_SECRET_KEY', '') })
        .catch(async (error: any) => this.handleTokenValidationError(error, user, response, refreshToken));

      return true;
    }, `Erro ao validar permissões do usuário`);
  }

  private async findUser(userId: number): Promise<UserEntity> {
    const foundUser: UserEntity = await this.findUserByIdUseCase.execute(userId)
      .catch((error: HttpException) => {
        if (error instanceof NotFoundException) throw new UnauthorizedException(`Credenciais inválidas (${UnauthorizedReasonsEnum.USER_NOT_FOUND})`);
        else throw error;
      });

    return foundUser;
  }

  private async handleTokenValidationError(
    error: any,
    user: UserEntity,
    response: Response,
    refreshToken?: string,
  ): Promise<void> {
    if (error instanceof TokenExpiredError) await this.handleExpiredTokenError(user, response, refreshToken);
    else if (error instanceof JsonWebTokenError) {
      const production: boolean = this.configService.get<boolean>('PRODUCTION', true);
      if (!production) console.error('', error);
      throw new UnauthorizedException(`Credenciais inválidas. (${UnauthorizedReasonsEnum.INVALID_TOKEN})`);
    }
    else throw new InternalServerErrorException(`Erro JWT inesperado: ${error.message}`);
  }

  private async handleExpiredTokenError(
    user: UserEntity,
    response: Response,
    refreshToken?: string,
  ): Promise<void> {
    if (refreshToken) {
      await this.jwtService.verifyAsync<UserJwtPayload>(refreshToken, { secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY', '') })
        .catch((error: any) => {
          if (error instanceof TokenExpiredError) throw new UnauthorizedException(`Sessão expirada (${UnauthorizedReasonsEnum.EXPIRED_SESSION})`);
          else if (error instanceof JsonWebTokenError) throw new UnauthorizedException(`Credenciais inválidas (${UnauthorizedReasonsEnum.INVALID_TOKEN})`);
          else throw new InternalServerErrorException(`Erro JWT inesperado: ${error.message}`);
        });

      await this.refreshUserSession(user, response);

    } else throw new UnauthorizedException(`Sessão expirada (${UnauthorizedReasonsEnum.EXPIRED_SESSION})`);
  }

  private async refreshUserSession(
    user: UserEntity,
    response: Response
  ): Promise<void> {
    const tokenPayload: UserJwtPayload = { id: user.id, email: user.email, role: user.role };
    const { accessToken: newAcessToken } = await this.generateJwtTokensUseCase.execute(tokenPayload);

    await this.configTokenCookiesUseCase.execute(response, newAcessToken);
  }
}

export function UseUserGuard(role?: UserRolesEnum) {
  return applyDecorators(
    SetMetadata(ROLE_METADATA_KEY, role),
    UseGuards(UserGuard)
  )
}