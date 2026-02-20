import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UserEntity } from "src/users/models/entities/user.entity";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";
import { FindAllUsersResponse } from "src/users/models/responses/find-all-users.response";

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository,
  ) { }

  async execute(pagination: PaginationDto): Promise<FindAllUsersResponse> {
    const result: FindAllUsersResponse = await this.repository.findAll(pagination);

    if (result.items.length < 1) throw new NotFoundException('Nenhum usuário encontrado');

    return result;
  }
}