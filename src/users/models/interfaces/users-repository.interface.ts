import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UserEntity } from "../entities/user.entity";
import { FindAllUsersResponse } from "../responses/find-all-users.response";

export interface IUsersRepository {
  create(user: UserEntity): Promise<UserEntity>
  findByEmail(email: string, selectPassword?: boolean): Promise<UserEntity | null>
  findById(id: number): Promise<UserEntity | null>
  findAll(pagination: PaginationDto): Promise<FindAllUsersResponse>
  count(): Promise<number>
  seed(users: Array<UserEntity>): Promise<void>
}