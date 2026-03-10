import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { ConfigTokenCookiesUseCase } from "./use-cases/config-token-cookies/config-token-cookies.use-case";
import { GenerateJwtTokensUseCase } from "./use-cases/generate-jwt-tokens/generate-jwt-tokens.use-case";
import { LoginUseCase } from "./use-cases/login/login.use-case";
import { LoginController } from "./use-cases/login/login.controller";
import { JwtService } from "@nestjs/jwt";
import { DecodeJwtTokenUseCase } from "./use-cases/decode-jwt-token/decode-jwt-token.use-case";
import { UserGuard } from "./guards/user.guard";

@Module({
  imports: [
    forwardRef(() => UsersModule)
  ],
  providers: [
    JwtService,
    ConfigTokenCookiesUseCase,
    GenerateJwtTokensUseCase,
    LoginUseCase,
    DecodeJwtTokenUseCase,
    UserGuard
  ],
  controllers: [
    LoginController
  ],
  exports: [
    UserGuard,
    DecodeJwtTokenUseCase,
    JwtService,
    ConfigTokenCookiesUseCase,
    GenerateJwtTokensUseCase
  ]
})
export class AuthModule { }