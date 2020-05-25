import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('warnings')
export class Warnings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 22 })
  server!: string;

  @Column({ type: 'varchar', length: 22 })
  user!: string;

  @Column({ type: 'varchar', length: 22 })
  moderator!: string;

  @Column({ type: 'text' })
  reason!: string;

  @CreateDateColumn()
  date!: Date;
}
