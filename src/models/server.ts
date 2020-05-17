import {
    Column,
    PrimaryColumn,
    Entity,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Warnings } from './warnings';

// TODO: Server config

@Entity('servers')
export class Servers {
    @PrimaryColumn({ type: 'text' })
    id!: string;

    @Column({ type: 'text' })
    prefix!: string;

    @OneToOne((type) => Warnings)
    @JoinColumn()
    warnings: Warnings;

    @CreateDateColumn()
    bot_joined!: Date;
}
