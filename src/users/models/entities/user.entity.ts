import { Exclude } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRolesEnum } from "../enums/user-roles.enum";

@Entity({ name: 'users' })
export class UserEntity {
  constructor(data: Omit<UserEntity, 'id' | 'active'>) {
    Object.assign(this, data);
    this.active = true;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRolesEnum, nullable: false })
  role: UserRolesEnum;

  @Column({ type: 'varchar', nullable: false, select: false })
  @Exclude()
  password: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  active: boolean;
}