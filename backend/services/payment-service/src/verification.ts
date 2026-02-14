export interface PaymentStrategy {
    verify(transactionId: string, amount: number): Promise<boolean>;
}

export class StripeStrategy implements PaymentStrategy {
    async verify(transactionId: string, amount: number): Promise<boolean> {
        console.log(`Verifying Stripe transaction ${transactionId} for amount ${amount}`);
        if (transactionId.toLowerCase().startsWith('fail')) return false;
        return true;
    }
}

export class RazorpayStrategy implements PaymentStrategy {
    async verify(transactionId: string, amount: number): Promise<boolean> {
        console.log(`Verifying Razorpay transaction ${transactionId} for amount ${amount}`);
        if (transactionId.toLowerCase().startsWith('fail')) return false;
        return true;
    }
}

export class PaymentProcessor {
    private strategies: { [key: string]: PaymentStrategy } = {};

    constructor() {
        this.strategies['STRIPE'] = new StripeStrategy();
        this.strategies['RAZORPAY'] = new RazorpayStrategy();
        this.strategies['MOCK'] = new StripeStrategy(); // Default to Stripe-like for mock
    }

    async verifyPayment(provider: string, transactionId: string, amount: number): Promise<boolean> {
        const strategy = this.strategies[provider.toUpperCase()];
        if (!strategy) {
            throw new Error(`Payment provider ${provider} not supported`);
        }
        return await strategy.verify(transactionId, amount);
    }
}
