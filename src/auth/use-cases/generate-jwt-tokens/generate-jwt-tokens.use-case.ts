import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { JwtPayload } from "src/auth/models/types/jwt-payload.type";
import { StringValue } from "ms";

@Injectable()
export class GenerateJwtTokensUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  execute(
    payload: JwtPayload,
    rememberMe?: boolean
  ): { accessToken: string, refreshToken?: string } {
    const accessTokenConfig: JwtSignOptions = {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get<string>('ACCESS_TOKEN_EXPIRATION_TIME') ?? 1}h` as StringValue
    }

    const refreshTokenConfig: JwtSignOptions = {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_TIME') ?? 7}d` as StringValue
    }

    const accessToken: string = this.jwtService.sign<JwtPayload>(payload, accessTokenConfig);
    const refreshToken: string | undefined = rememberMe
      ? this.jwtService.sign<JwtPayload>(payload, refreshTokenConfig)
      : undefined;

    return { accessToken, refreshToken };
  }
}