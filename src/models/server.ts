import { Column, PrimaryColumn, Entity, CreateDateColumn } from 'typeorm';

// TODO: Server config

@Entity('servers')
export class Servers {
    @PrimaryColumn({ type: 'text' })
    id!: string;

    @Column({ type: 'text' })
    prefix!: string;

    @CreateDateColumn()
    bot_joined!: Date;
}
