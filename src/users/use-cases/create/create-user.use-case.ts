import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "src/users/models/dtos/create-user.dto";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";
import { FindUserByEmailUseCase } from "../find-by-email/find-user-by-email.use-case";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository,

    private readonly findUserByEmailUseCase: FindUserByEmailUseCase
  ) { }

  async execute(data: CreateUserDto): Promise<UserEntity> {
    const emailAlreadyExists: boolean = await this.findUserByEmailUseCase.execute(data.email)
      .then(() => true)
      .catch((error) => {
        if (error instanceof NotFoundException) return false
        else throw error;
      });

    if (emailAlreadyExists) throw new ConflictException(`Já existe um usuário cadastrado com o email ${data.email}`);

    const user = new UserEntity(data);

    return await this.repository.create(user);
  }
}