import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./models/entities/user.entity";
import { UsersTypeOrmRepository } from "./users.repository";
import { CreateUserUseCase } from "./use-cases/create/create-user.use-case";
import { CreateUserController } from "./use-cases/create/create-user.controller";
import { FindUserByEmailUseCase } from "./use-cases/find-by-email/find-user-by-email.use-case";
import { FindAllUsersUseCase } from "./use-cases/find-all/find-all-users.use-case";
import { FindAllUsersController } from "./use-cases/find-all/find-all-users.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  providers: [
    { provide: 'UsersRepository', useClass: UsersTypeOrmRepository },
    CreateUserUseCase,
    FindUserByEmailUseCase,
    FindAllUsersUseCase
  ],
  controllers: [
    CreateUserController,
    FindAllUsersController
  ]
})
export class UsersModule { }