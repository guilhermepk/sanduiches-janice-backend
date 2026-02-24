import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { ConfigTokenCookiesUseCase } from "./use-cases/config-token-cookies/config-token-cookies.use-case";
import { GenerateJwtTokensUseCase } from "./use-cases/generate-jwt-tokens/generate-jwt-tokens.use-case";
import { LoginUseCase } from "./use-cases/login/login.use-case";
import { LoginController } from "./use-cases/login/login.controller";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    UsersModule
  ],
  providers: [
    JwtService,
    ConfigTokenCookiesUseCase,
    GenerateJwtTokensUseCase,
    LoginUseCase
  ],
  controllers: [
    LoginController
  ],
})
export class AuthModule { }