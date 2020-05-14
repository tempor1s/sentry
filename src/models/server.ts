import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm'

// TODO: Server config

@Entity('servers')
export class Servers {
    @PrimaryGeneratedColumn()
    id!: number
}
