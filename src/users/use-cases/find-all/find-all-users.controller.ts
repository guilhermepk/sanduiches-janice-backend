import { Controller, Get, Query, ValidationPipe } from "@nestjs/common";
import { FindAllUsersUseCase } from "./find-all-users.use-case";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UseUserGuard } from "src/auth/guards/user.guard";
import { UserRolesEnum } from "src/users/models/enums/user-roles.enum";

@UseUserGuard(UserRolesEnum.ADMIN)
@Controller('users')
export class FindAllUsersController {
  constructor(
    private readonly useCase: FindAllUsersUseCase
  ) { }

  @Get('find-all')
  async handle(
    @Query(new ValidationPipe({ transform: true })) pagination: PaginationDto
  ) {
    return await this.useCase.execute(pagination);
  }
}