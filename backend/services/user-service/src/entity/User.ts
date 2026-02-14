import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password_hash!: string;

    @Column("decimal", { precision: 5, scale: 2, default: 50.0 })
    trust_score!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
