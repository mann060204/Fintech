import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum AgreementStatus {
    PENDING = "PENDING",
    AGREED = "AGREED",
    COMPLETED = "COMPLETED",
    DISPUTED = "DISPUTED",
    MOCK_DISPUTED = "MOCK_DISPUTED"
}

@Entity()
export class Agreement {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column("text", { nullable: true })
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column()
    creatorId: string;

    @Column()
    participantId: string;

    @Column({
        type: "enum",
        enum: AgreementStatus,
        default: AgreementStatus.PENDING
    })
    status: AgreementStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
