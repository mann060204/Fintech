import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export enum PaymentProvider {
    STRIPE = "STRIPE",
    RAZORPAY = "RAZORPAY",
    MOCK = "MOCK"
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    agreementId: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column()
    payerId: string;

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({
        type: "enum",
        enum: PaymentProvider,
        default: PaymentProvider.MOCK
    })
    provider: PaymentProvider;

    @Column({ nullable: true })
    externalTransactionId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
