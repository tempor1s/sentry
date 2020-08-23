import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Servers } from './server';

@Entity('warnings')
export class Warnings {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Servers, (servers) => servers.warnings)
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
