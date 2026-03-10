import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { UserJwtPayload } from "src/auth/models/types/user-jwt-payload.type";
import { StringValue } from "ms";
import { tryCatch } from "src/common/utils/try-catch.util";

@Injectable()
export class GenerateJwtTokensUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async execute(
    payload: UserJwtPayload,
    rememberMe?: boolean
  ): Promise<{ accessToken: string, refreshToken?: string }> {
    return await tryCatch(async () => {
      const accessTokenConfig: JwtSignOptions = {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
        expiresIn: `${this.configService.get<string>('ACCESS_TOKEN_EXPIRATION_TIME') ?? 1}h` as StringValue
      }

      const refreshTokenConfig: JwtSignOptions = {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: `${this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_TIME') ?? 7}d` as StringValue
      }

      const accessToken: string = this.jwtService.sign<UserJwtPayload>(payload, accessTokenConfig);
      const refreshToken: string | undefined = rememberMe
        ? this.jwtService.sign<UserJwtPayload>(payload, refreshTokenConfig)
        : undefined;

      return { accessToken, refreshToken };
    }, `Erro ao gerar tokens JWT`);
  }
}