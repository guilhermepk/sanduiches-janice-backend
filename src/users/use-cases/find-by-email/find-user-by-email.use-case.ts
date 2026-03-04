import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { tryCatch } from "src/common/utils/try-catch.util";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository
  ) { }

  async execute(
    email: string,
    selectPassword: boolean = false
  ): Promise<UserEntity> {
    return await tryCatch(async () => {
      const foundUser: UserEntity | null = await this.repository.findByEmail(email, selectPassword);

      if (!foundUser) throw new NotFoundException(`Nenhum usuário com o email '${email}' encontrado`);

      return foundUser;
    }, `Erro ao buscar usuário pelo email ${email}`);
  }
}