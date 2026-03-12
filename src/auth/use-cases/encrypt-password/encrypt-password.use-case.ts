import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { tryCatch } from "src/common/utils/try-catch.util";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptPasswordUseCase {
  constructor(
    private readonly configService: ConfigService
  ) { }

  async execute(password: string): Promise<string> {
    return await tryCatch(async () => {
      const envValue = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
      const SALT_ROUNDS = Number(envValue);

      if (!SALT_ROUNDS || isNaN(SALT_ROUNDS) || SALT_ROUNDS <= 0) {
        throw new Error(`O valor '${envValue}' não é um valor válido como salt rounds. O valor deve ser um número inteiro positivo.`);
      }

      const encryptedPassword: string = await bcrypt.hash(password, SALT_ROUNDS);
      return encryptedPassword;
    }, `Erro ao criptografar senha do usuário`);
  }
}