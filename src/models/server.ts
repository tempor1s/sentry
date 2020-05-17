import {
    Column,
    PrimaryColumn,
    Entity,
    CreateDateColumn,
    OneToOne,
} from 'typeorm';
import { Warnings } from './warnings';

// TODO: Server config

@Entity('servers')
export class Servers {
    @PrimaryColumn()
    id!: number;

    @OneToOne((type) => Warnings)
    warnings!: Warnings;

    @CreateDateColumn()
    bot_joined!: Date;
}
