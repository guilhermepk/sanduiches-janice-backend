import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { tryCatch } from "src/common/utils/try-catch.util";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository
  ) { }

  async execute(id: number): Promise<UserEntity> {
    return await tryCatch(async () => {
      const foundUser: UserEntity | null = await this.repository.findById(id);

      if (!foundUser) throw new NotFoundException(`Usuário de ID ${id} não encontrado`);

      return foundUser;
    }, `Erro ao buscar usuário por ID ${id}`);
  }
}