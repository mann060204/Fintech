import "reflect-metadata";
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { Transaction, PaymentStatus } from './entity/Transaction';
import { PaymentProcessor } from './verification';

dotenv.config();

const app = express();
app.use(express.json());

const processor = new PaymentProcessor();

app.post('/verify-payment', async (req, res) => {
    const { transactionId, provider, amount, agreementId, payerId } = req.body;

    try {
        // 1. Verify with strategy
        const isVerified = await processor.verifyPayment(provider, transactionId, amount);

        // 2. Record transaction in DB
        const transactionRepository = AppDataSource.getRepository(Transaction);
        const transaction = new Transaction();
        transaction.agreementId = agreementId;
        transaction.amount = amount;
        transaction.payerId = payerId;
        transaction.provider = provider;
        transaction.externalTransactionId = transactionId;
        transaction.status = isVerified ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

        await transactionRepository.save(transaction);

        res.json({
            verified: isVerified,
            status: transaction.status,
            transactionId: transaction.id
        });
    } catch (error: any) {
        console.error("Payment processing error:", error);
        res.status(500).json({ verified: false, error: error.message });
    }
});

const PORT = 4002;

AppDataSource.initialize().then(() => {
    console.log("Payment Data Source initialized");
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Payment Service running on port ${PORT}`);
    });
}).catch((err: any) => {
    console.error("Error initializing Payment Data Source", err);
});
