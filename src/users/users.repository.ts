import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UserEntity } from "./models/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IUsersRepository } from "./models/interfaces/users-repository.interface";

@Injectable()
export class UsersTypeOrmRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) { }

  async create(user: UserEntity): Promise<UserEntity> {
    return await this.repository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.repository.findOneBy({ email });
  }
}