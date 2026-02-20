import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./models/entities/user.entity";
import { UsersTypeOrmRepository } from "./users.repository";
import { CreateUserUseCase } from "./use-cases/create/create-user.use-case";
import { CreateUserController } from "./use-cases/create/create-user.controller";
import { FindUserByEmailUseCase } from "./use-cases/find-by-email/find-user-by-email.use-case";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  providers: [
    { provide: 'UsersRepository', useClass: UsersTypeOrmRepository },
    CreateUserUseCase,
    FindUserByEmailUseCase
  ],
  controllers: [
    CreateUserController
  ]
})
export class UsersModule { }