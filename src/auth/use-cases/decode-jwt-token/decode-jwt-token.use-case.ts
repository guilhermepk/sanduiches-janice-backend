import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedReasonsEnum } from "src/auth/models/enums/unauthorized-reasons.enum";
import { tryCatch } from "src/common/utils/try-catch.util";

@Injectable()
export class DecodeJwtTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async execute<Token extends object>(token: string, scheme: Token): Promise<Token> {
    return await tryCatch(async () => {
      const decodedToken: Token = this.jwtService.decode<Token>(token);

      this.validateTokenFormat<Token>(decodedToken, scheme);

      return decodedToken;
    }, `Erro ao decodificar token. Verifique a integridade do formato do token`);
  }

  private validateTokenFormat<Token extends Record<string, any>>(token: any, scheme: Token): void {
    if (token === null || typeof token !== 'object') this.throwUnauthorizedError(`Ó aqui a porra do teu token: ${JSON.stringify(token)}`);

    const { iat, exp, ...rest } = token;

    const receivedKeys = Object.keys(rest);
    const expectedKeys = Object.keys(scheme);

    if (receivedKeys.length !== expectedKeys.length) this.throwUnauthorizedError(`Era pra ter ${expectedKeys.length} chaves mas tem ${receivedKeys.length}. Token: ${JSON.stringify(token)}`);

    for (const expectedKey of expectedKeys) {
      if (!(expectedKey in token)) this.throwUnauthorizedError(`O token deveria ter a chave ${expectedKey} mas não tem`);

      if (typeof token[expectedKey] !== typeof scheme[expectedKey]) this.throwUnauthorizedError(`O tipo da chave ${expectedKey} deveria ser ${typeof token[expectedKey]} mas é ${typeof scheme[expectedKey]}`);
    }
  }

  private throwUnauthorizedError(message?: string): never {
    const production: boolean = this.configService.get<boolean>('PRODUCTION', true)

    const finalMessage: string = production ? '' : ` - ${message}`;

    throw new UnauthorizedException(`Credenciais inválidas (${UnauthorizedReasonsEnum.INVALID_TOKEN})${finalMessage}`);
  }
}