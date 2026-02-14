import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Group } from "./Group";

@Entity()
export class Expense {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column()
    payerId: string;

    @Column("simple-json")
    splits: { userId: string; amount: number }[];

    @ManyToOne(() => Group, group => group.expenses)
    group: Group;

    @CreateDateColumn()
    createdAt: Date;
}
