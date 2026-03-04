import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "src/users/models/dtos/create-user.dto";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";
import { FindUserByEmailUseCase } from "../find-by-email/find-user-by-email.use-case";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcryptjs';
import { tryCatch } from "src/common/utils/try-catch.util";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository,

    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,

    private readonly configService: ConfigService
  ) { }

  async execute(data: CreateUserDto): Promise<UserEntity> {
    return await tryCatch(async () => {
      const emailAlreadyExists: boolean = await this.findUserByEmailUseCase.execute(data.email)
        .then(() => true)
        .catch((error) => {
          if (error instanceof NotFoundException) return false
          else throw error;
        });

      if (emailAlreadyExists) throw new ConflictException(`Já existe um usuário cadastrado com o email ${data.email}`);

      const encryptedPassword: string = await this.encryptPassword(data.password);

      const user = new UserEntity({ ...data, password: encryptedPassword });

      return await this.repository.create(user);
    }, `Erro ao criar usuário`);
  }

  private async encryptPassword(password: string): Promise<string> {
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