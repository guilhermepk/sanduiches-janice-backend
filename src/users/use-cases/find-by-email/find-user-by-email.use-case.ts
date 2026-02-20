import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository
  ) { }

  async execute(email: string): Promise<UserEntity> {
    const foundUser: UserEntity | null = await this.repository.findByEmail(email);

    if (!foundUser) throw new NotFoundException(`Nenhum usuário com o email '${email}' encontrado`);

    return foundUser;
  }
}