import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRolesEnum } from "../enums/user-roles.enum";

export class CreateUserDto {
  @IsNotEmpty({ message: `'name' não pode estar vazio` })
  @IsString({ message: `'name' deve ser do tipo string` })
  name: string;

  @IsNotEmpty({ message: `'email' não pode estar vazio` })
  @IsString({ message: `'email' deve ser do tipo string` })
  @IsEmail(undefined, { message: `'email' deve ser um email válido` })
  email: string;

  @IsNotEmpty({ message: `'password' não pode estar vazio` })
  @IsString({ message: `'password' deve ser do tipo string` })
  password: string;

  @IsNotEmpty({ message: `'role' não pode estar vazio` })
  @IsEnum(UserRolesEnum, { message: `'role' deve ser um dos seguintes: ${Object.values(UserRolesEnum).map(value => `'${value}'`).join(', ')}` })
  role: UserRolesEnum;
}