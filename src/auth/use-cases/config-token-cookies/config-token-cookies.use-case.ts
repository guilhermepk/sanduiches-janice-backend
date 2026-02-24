import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CookieOptions, Response } from "express";
import { ACCESS_TOKEN_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY } from "src/auth/auth.constants";

@Injectable()
export class ConfigTokenCookiesUseCase {
  constructor(
    private readonly configService: ConfigService
  ) { }

  execute(
    response: Response,
    accessToken: string,
    refreshToken?: string
  ): void {
    const cookieOptions: CookieOptions = {
      httpOnly: this.configService.get<boolean>('PRODUCTION') ?? true,
      secure: this.configService.get<boolean>('PRODUCTION') ?? true,
      sameSite: 'none',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_TIME') ?? 8 * 1000 * 60 * 60 * 24
    };

    console.log(cookieOptions);

    response.cookie(
      ACCESS_TOKEN_COOKIE_KEY,
      accessToken,
      cookieOptions
    );

    if (refreshToken) {
      response.cookie(
        REFRESH_TOKEN_COOKIE_KEY,
        refreshToken,
        cookieOptions
      );
    }
  }
}