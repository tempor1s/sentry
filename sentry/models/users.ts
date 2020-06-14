import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity('users')
export class Users extends BaseEntity {
  @Field()
  @PrimaryColumn({ type: 'varchar', length: 22, unique: true })
  id!: string;

  @Field()
  @Column({ type: 'text' })
  email!: string;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
