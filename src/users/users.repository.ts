import { Injectable, NotFoundException } from "@nestjs/common";
import { FindOptionsSelect, Repository } from "typeorm";
import { UserEntity } from "./models/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IUsersRepository } from "./models/interfaces/users-repository.interface";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { FindAllUsersResponse } from "./models/responses/find-all-users.response";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsersTypeOrmRepository implements IUsersRepository {
  private dbSchema: string = '';

  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,

    configService: ConfigService
  ) {
    this.dbSchema = configService.get<string>('DB_SCHEMA', 'public')
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const savedUser: UserEntity = await this.repository.save(user);
    savedUser.password = '';
    return savedUser;
  }

  async findByEmail(email: string, selectPassword: boolean = false): Promise<UserEntity | null> {
    const select: FindOptionsSelect<UserEntity> | undefined = selectPassword ? {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true
    } : undefined

    return await this.repository.findOne({
      where: { email },
      select
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(pagination: PaginationDto): Promise<FindAllUsersResponse> {
    const { page = 1, quantity = 10 } = pagination;

    const offset = (page - 1) * quantity;

    const [foundUsers, total] = await this.repository.findAndCount({
      take: quantity,
      skip: offset
    });

    const totalPages: number = Math.ceil(total / quantity);

    if (page > totalPages) throw new NotFoundException(`Página requisitada (${page}) excede o total de páginas (${totalPages})`);

    return {
      items: foundUsers,
      totalPages
    };
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async seed(
    users: Array<UserEntity>
  ): Promise<void> {
    if (users.length < 1) return;

    const mapUser = (user: UserEntity) => {
      const { name, email, password, role } = user;

      return `('${name}', '${email}', '${password}', '${role}'::users_role_enum)`;
    }

    const mappedUsers = users.map(mapUser).join(', ');

    const query = `--sql
      WITH tabela_de_novos_usuarios (name, email, password, role) AS (
        VALUES ${mappedUsers}
      )
      INSERT INTO public.users (name, email, password, role)
      SELECT name, email, password, role 
      FROM tabela_de_novos_usuarios
      WHERE NOT EXISTS (
        SELECT 1 FROM public.users
      );

      SELECT * FROM public.users;
    `;

    await this.repository.query(query);
  }
}