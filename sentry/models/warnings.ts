import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Servers } from './server';

@Entity('warnings')
export class Warnings {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Servers, (servers) => servers.warnings, { cascade: true })
  server!: Servers;

  @Column({ type: 'varchar', length: 22 })
  user!: string;

  @Column({ type: 'varchar', length: 22 })
  moderator!: string;

  @Column({ type: 'text' })
  reason!: string;

  @CreateDateColumn()
  date!: Date;
}
