import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserUseCase } from "./create-user.use-case";
import { CreateUserDto } from "src/users/models/dtos/create-user.dto";

@Controller('users')
export class CreateUserController {
  constructor(
    private readonly useCase: CreateUserUseCase
  ) { }

  @Post('create')
  async handle(
    @Body() body: CreateUserDto
  ) {
    return await this.useCase.execute(body);
  }
}