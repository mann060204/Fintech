import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Expense } from "./Expense";

@Entity()
export class Group {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    creatorId: string;

    @Column("simple-array")
    members: string[]; // List of User IDs

    @OneToMany(() => Expense, expense => expense.group)
    expenses: Expense[];

    @CreateDateColumn()
    createdAt: Date;
}
