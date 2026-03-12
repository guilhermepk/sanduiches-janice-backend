import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EncryptPasswordUseCase } from "src/auth/use-cases/encrypt-password/encrypt-password.use-case";
import { UserEntity } from "src/users/models/entities/user.entity";
import { UserRolesEnum } from "src/users/models/enums/user-roles.enum";
import type { IUsersRepository } from "src/users/models/interfaces/users-repository.interface";
import { EnvUser } from "src/users/models/types/env-users.type";

@Injectable()
export class SeedUsersUseCase {
  private logger: Logger = new Logger(SeedUsersUseCase.name);

  constructor(
    @Inject('UsersRepository')
    private readonly repository: IUsersRepository,

    private readonly configService: ConfigService,

    private readonly encryptPasswordUseCase: EncryptPasswordUseCase
  ) { }

  async execute(): Promise<void> {
    const totalUsers: number = await this.repository.count();

    if (totalUsers > 0) {
      this.logger.debug(`Já existem usuários no banco de dados. Pulando seeder...`);

      return;
    }

    this.logger.debug('Iniciando seed de usuários...');

    const usersToSeed: Array<UserEntity> = await this.getUsersToSeed();

    try {
      await this.repository.seed(usersToSeed);

      this.logger.debug(`Usuários da env semeados com sucesso (${usersToSeed.map(user => user.name).join(', ')})`);
    } catch (error) {
      this.logger.error(`Não foi possível semear os usuários da env. Erro: ${error}`);
    }
  }

  private async getUsersToSeed(): Promise<Array<UserEntity>> {
    const envUsers: string = this.configService.get<string>('SEED_USERS', '');

    let rawUsers: Array<EnvUser> = [];

    try {
      rawUsers = JSON.parse(envUsers);
    } catch (error) {
      this.logger.error(`Não foi possível converter os usuários da env de string para JSON. Erro: ${error}`);
    }

    const users: Array<UserEntity> = await this.parseUsers(rawUsers);

    return users;
  }

  private async parseUsers(
    rawUsers: Array<EnvUser>
  ): Promise<Array<UserEntity>> {
    const validRoles: Array<string> = Object.values(UserRolesEnum);

    const parsedUsers: Array<UserEntity> = [];

    await Promise.all(
      rawUsers.map(async (rawUser, index) => {
        const { name, email, password, role } = rawUser;

        const encryptedPassword: string = await this.encryptPasswordUseCase.execute(password);

        if (!validRoles.includes(role)) {
          this.logger.error(`"${role}" não é um cargo válido. Usuário ${name} não semeado. Cargos válidos: ${validRoles.join(', ')}`);
        }

        const user = new UserEntity({ name, email, password: encryptedPassword, role: role as UserRolesEnum });

        parsedUsers.push(user);
      })
    )

    return parsedUsers;
  }
}