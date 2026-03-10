import { Injectable, NotFoundException } from "@nestjs/common";
import { FindOptionsSelect, Repository } from "typeorm";
import { UserEntity } from "./models/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IUsersRepository } from "./models/interfaces/users-repository.interface";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { FindAllUsersResponse } from "./models/responses/find-all-users.response";

@Injectable()
export class UsersTypeOrmRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) { }

  async create(user: UserEntity): Promise<UserEntity> {
    const savedUser: UserEntity = await this.repository.save(user);
    savedUser.password = '';
    return savedUser;
  }

  async findByEmail(email: string, selectPassword: boolean = false): Promise<UserEntity | null> {
    const select: FindOptionsSelect<UserEntity> | undefined = selectPassword ? {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true
    } : undefined

    return await this.repository.findOne({
      where: { email },
      select
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(pagination: PaginationDto): Promise<FindAllUsersResponse> {
    const { page = 1, quantity = 10 } = pagination;

    const offset = (page - 1) * quantity;

    const [foundUsers, total] = await this.repository.findAndCount({
      take: quantity,
      skip: offset
    });

    const totalPages: number = Math.ceil(total / quantity);

    if (page > totalPages) throw new NotFoundException(`Página requisitada (${page}) excede o total de páginas (${totalPages})`);

    return {
      items: foundUsers,
      totalPages
    };
  }
}