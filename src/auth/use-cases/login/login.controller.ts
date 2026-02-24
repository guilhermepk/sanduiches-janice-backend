import { Body, Controller, Post, Res } from "@nestjs/common";
import { LoginUseCase } from "./login.use-case";
import type { Response } from "express";
import { LoginDto } from "../../../auth/models/dtos/login.dto";

@Controller('auth')
export class LoginController {
  constructor(
    private readonly useCase: LoginUseCase
  ) { }

  @Post('login')
  async execute(
    @Body() body: LoginDto,
    @Res() response: Response
  ): Promise<Response> {
    return await this.useCase.execute(body, response);
  }
}