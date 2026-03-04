import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "src/auth/models/dtos/login.dto";
import { Response } from "express";
import { UserEntity } from "src/users/models/entities/user.entity";
import { JwtPayload } from "src/auth/models/types/jwt-payload.type";
import { ConfigTokenCookiesUseCase } from "../config-token-cookies/config-token-cookies.use-case";
import { GenerateJwtTokensUseCase } from "../generate-jwt-tokens/generate-jwt-tokens.use-case";
import { FindUserByEmailUseCase } from "src/users/use-cases/find-by-email/find-user-by-email.use-case";
import * as bcrypt from 'bcryptjs';
import { tryCatch } from "src/common/utils/try-catch.util";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly configTokenCookiesUseCase: ConfigTokenCookiesUseCase,
    private readonly generateJwtTokensUseCase: GenerateJwtTokensUseCase
  ) { }

  async execute(
    data: LoginDto,
    response: Response
  ): Promise<Response> {
    return await tryCatch(async () => {
      const { email, password, rememberMe } = data;

      const foundUser: UserEntity = await this.validateUser(email, password);

      const tokenPayload: JwtPayload = { id: foundUser.id, email: foundUser.email, role: '' };

      const { accessToken, refreshToken } = await this.generateJwtTokensUseCase.execute(tokenPayload, rememberMe);

      this.configTokenCookiesUseCase.execute(response, accessToken, refreshToken);

      return response.status(HttpStatus.OK).send({ success: true });
    }, `Erro ao iniciar sessão`);
  }

  private async validateUser(
    email: string,
    password: string
  ) {
    return await tryCatch(async () => {
      const errorMessage = 'Email e senha não conferem';

      const foundUser: UserEntity = await this.findUserByEmailUseCase.execute(email)
        .catch((error) => {
          if (error instanceof NotFoundException) throw new UnauthorizedException(errorMessage);
          else throw error;
        });

      const validPassword: boolean = await bcrypt.compare(password, foundUser.password);

      if (!validPassword) throw new UnauthorizedException(errorMessage);

      return foundUser;
    }, `Erro ao validar usuário`);
  }
}