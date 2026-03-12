import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "src/users/models/dtos/create-user.dto";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";
import { FindUserByEmailUseCase } from "../find-by-email/find-user-by-email.use-case";
import { tryCatch } from "src/common/utils/try-catch.util";
import { EncryptPasswordUseCase } from "src/auth/use-cases/encrypt-password/encrypt-password.use-case";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository,

    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,

    private readonly encryptPasswordUseCase: EncryptPasswordUseCase
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

      const encryptedPassword: string = await this.encryptPasswordUseCase.execute(data.password);

      const user = new UserEntity({ ...data, password: encryptedPassword });

      return await this.repository.create(user);
    }, `Erro ao criar usuário`);
  }
}