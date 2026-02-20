import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from "@nestjs/common";
import { CreateUserUseCase } from "./create-user.use-case";
import { CreateUserDto } from "src/users/models/dtos/create-user.dto";

@Controller('users')
export class CreateUserController {
  constructor(
    private readonly useCase: CreateUserUseCase
  ) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async handle(
    @Body() body: CreateUserDto
  ) {
    return await this.useCase.execute(body);
  }
}