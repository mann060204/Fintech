import { AppDataSource } from "./data-source";
import { Agreement, AgreementStatus } from "./entity/Agreement";
import { Group } from "./entity/Group";
import { Expense } from "./entity/Expense";

export const resolvers = {
    Query: {
        getAgreement: async (_: any, { id }: { id: string }) => {
            const agreementRepository = AppDataSource.getRepository(Agreement);
            return await agreementRepository.findOneBy({ id });
        },
        listAgreements: async (_: any, { userId }: { userId: string }) => {
            const agreementRepository = AppDataSource.getRepository(Agreement);
            return await agreementRepository.find({
                where: [
                    { creatorId: userId },
                    { participantId: userId }
                ]
            });
        },
        getUserTrustScore: async (_: any, { userId }: { userId: string }) => {
            const TRUST_AI_URL = process.env.TRUST_AI_URL || 'http://trust-ai-engine:8001';
            try {
                // Fetch score from Python AI Engine
                // URL updated to match Python endpoint /calculate-trust-score
                const response = await fetch(`${TRUST_AI_URL}/calculate-trust-score`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        history: {
                            total_transactions: 10,
                            successful_payments: 8,
                            failed_payments: 1,
                            defaults: 1,
                            average_transaction_amount: 150.0
                        }
                    })
                });

                if (!response.ok) {
                    console.error(`Trust AI returned ${response.status}: ${response.statusText}`);
                    const text = await response.text();
                    console.error(`Response body: ${text}`);
                    return 50.0;
                }

                const data = await response.json();
                return data.trust_score;
            } catch (error) {
                console.error("Error fetching trust score:", error);
                return 50.0; // Default fallback score
            }
        },
        listGroups: async (_: any, { userId }: { userId: string }) => {
            const groupRepo = AppDataSource.getRepository(Group);
            // Fetch all and filter in memory for MVP simplicity with simple-array
            const allGroups = await groupRepo.find();
            return allGroups.filter(g => g.members.includes(userId) || g.creatorId === userId);
        },
        getGroup: async (_: any, { groupId }: { groupId: string }) => {
            const groupRepo = AppDataSource.getRepository(Group);
            return await groupRepo.findOne({ where: { id: groupId } });
        },
        getGroupBalances: async (_: any, { groupId }: { groupId: string }) => {
            const groupRepo = AppDataSource.getRepository(Group);
            const expenseRepo = AppDataSource.getRepository(Expense);

            const group = await groupRepo.findOne({ where: { id: groupId } });
            if (!group) throw new Error("Group not found");

            const expenses = await expenseRepo.find({ where: { group: { id: groupId } } });

            // 1. Calculate Net Balances
            // key: userId, value: net amount (positive = owes money, negative = owed money)
            // Wait, standard convention: +ve = is owed (surplus), -ve = owes (deficit)
            const balances: { [key: string]: number } = {};

            group.members.forEach(m => balances[m] = 0);

            expenses.forEach(expense => {
                const paidBy = expense.payerId;
                const totalAmount = Number(expense.amount);

                // Assuming equal split for now if splits is empty or simple logic
                // For MVP, we use the splits data if available, else equal split among members
                // The current addExpense implementation takes a 'splits' array.

                if (expense.splits && Array.isArray(expense.splits) && expense.splits.length > 0) {
                    expense.splits.forEach((split: any) => {
                        const debtor = split.userId;
                        const amount = Number(split.amount);

                        // Payer pays 'amount' for 'debtor'
                        // Payer gets +amount, Debtor gets -amount
                        if (debtor !== paidBy) {
                            balances[paidBy] = (balances[paidBy] || 0) + amount;
                            balances[debtor] = (balances[debtor] || 0) - amount;
                        }
                    });
                } else {
                    // Fallback to equal split (excluding payer logic simplified)
                    // If I pay 100 for 2 people (me and B), split is 50 each.
                    // I am owed 50. B owes 50.
                    // My Net: +50. B's Net: -50.
                    // Implementation: Payer +100. Everyone -50.
                    const splitAmount = totalAmount / group.members.length;
                    balances[paidBy] = (balances[paidBy] || 0) + totalAmount;

                    group.members.forEach(member => {
                        balances[member] = (balances[member] || 0) - splitAmount;
                    });
                }
            });

            // 2. Simplify Debts (Basic greedy algorithm)
            const debtors: { id: string, amount: number }[] = [];
            const creditors: { id: string, amount: number }[] = [];

            Object.keys(balances).forEach(userId => {
                const amount = balances[userId];
                // Tolerance for floating point errors
                if (amount < -0.01) debtors.push({ id: userId, amount: -amount }); // Store positive magnitude
                if (amount > 0.01) creditors.push({ id: userId, amount: amount });
            });

            const transactions: any[] = [];

            let i = 0; // debtor index
            let j = 0; // creditor index

            while (i < debtors.length && j < creditors.length) {
                const debtor = debtors[i];
                const creditor = creditors[j];

                const amount = Math.min(debtor.amount, creditor.amount);

                transactions.push({
                    id: `${debtor.id}-${creditor.id}-${Date.now()}-${i}-${j}`, // Pseudo-ID
                    debtorId: debtor.id,
                    creditorId: creditor.id,
                    amount: Number(amount.toFixed(2))
                });

                debtor.amount -= amount;
                creditor.amount -= amount;

                if (debtor.amount < 0.01) i++;
                if (creditor.amount < 0.01) j++;
            }

            return transactions;
        }
    },
    Mutation: {
        createAgreement: async (_: any, args: { title: string; amount: number; description?: string; creatorId: string; participantId: string }) => {
            const agreementRepository = AppDataSource.getRepository(Agreement);
            const agreement = new Agreement();
            agreement.title = args.title;
            agreement.amount = args.amount;
            agreement.description = args.description || "";
            agreement.creatorId = args.creatorId;
            agreement.participantId = args.participantId;
            agreement.status = AgreementStatus.PENDING;

            return await agreementRepository.save(agreement);
        },
        updateAgreementStatus: async (_: any, { id, status }: { id: string; status: AgreementStatus }) => {
            const agreementRepository = AppDataSource.getRepository(Agreement);
            const agreement = await agreementRepository.findOneBy({ id });
            if (!agreement) throw new Error("Agreement not found");

            agreement.status = status;
            return await agreementRepository.save(agreement);
        },
        verifyPayment: async (_: any, { agreementId, transactionId, provider }: { agreementId: string; transactionId: string; provider: string }) => {
            const agreementRepository = AppDataSource.getRepository(Agreement);
            const agreement = await agreementRepository.findOneBy({ id: agreementId });
            if (!agreement) throw new Error("Agreement not found");

            // Call Payment Service
            const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:4002';
            try {
                // Using basic fetch for demo (ensure node 18+)
                const response = await fetch(`${PAYMENT_SERVICE_URL}/verify-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactionId,
                        provider: provider.toUpperCase(), // Ensure uppercase for enum
                        amount: agreement.amount,
                        agreementId: agreement.id,
                        payerId: agreement.participantId // Assuming participant pays
                    })
                });

                const data = await response.json();
                if (data.verified) {
                    agreement.status = AgreementStatus.COMPLETED;
                    // TODO: Call Trust AI here to update score
                } else {
                    agreement.status = AgreementStatus.MOCK_DISPUTED; // Fixed enum issue below by using string or updating enum
                    throw new Error(`Payment verification failed: ${data.error}`);
                }

                return await agreementRepository.save(agreement);
            } catch (error: any) {
                console.error("Payment verification error:", error);
                throw new Error(`Payment service unavailable or error: ${error.message}`);
            }
        },
        checkLocationContext: async (_: any, { latitude, longitude }: { latitude: number; longitude: number }) => {
            const CONTEXT_AI_URL = process.env.CONTEXT_AI_URL || 'http://context-ai-engine:8002';
            try {
                const response = await fetch(`${CONTEXT_AI_URL}/analyze-context`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude, longitude })
                });

                if (!response.ok) {
                    throw new Error(`Context AI returned ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error("Error checking context:", error);
                // Default to safe (allow notifications) if error
                return { suppress_notifications: false, reason: "Error checking context", location_type: "Unknown" };
            }
        },
        createGroup: async (_: any, { name, creatorId }: { name: string; creatorId: string }) => {
            const groupRepository = AppDataSource.getRepository(Group);
            const group = new Group();
            group.name = name;
            group.creatorId = creatorId;
            group.members = [creatorId];
            return await groupRepository.save(group);
        },
        addMemberToGroup: async (_: any, { groupId, userId }: { groupId: string; userId: string }) => {
            const groupRepository = AppDataSource.getRepository(Group);
            const group = await groupRepository.findOneBy({ id: groupId });
            if (!group) throw new Error("Group not found");

            if (!group.members.includes(userId)) {
                group.members.push(userId);
                await groupRepository.save(group);
            }
            return group;
        },
        addExpense: async (_: any, { groupId, description, amount, payerId, splits }: { groupId: string; description: string; amount: number; payerId: string; splits: any[] }) => {
            const groupRepository = AppDataSource.getRepository(Group);
            const expenseRepository = AppDataSource.getRepository(Expense);

            const group = await groupRepository.findOneBy({ id: groupId });
            if (!group) throw new Error("Group not found");

            const expense = new Expense();
            expense.description = description;
            expense.amount = amount;
            expense.payerId = payerId;
            expense.splits = splits;
            expense.group = group;

            return await expenseRepository.save(expense);
        },
        settleDebt: async (_: any, { groupId, debtorId, creditorId, amount }: { groupId: string; debtorId: string; creditorId: string; amount: number }) => {
            const groupRepository = AppDataSource.getRepository(Group);
            const expenseRepository = AppDataSource.getRepository(Expense);

            const group = await groupRepository.findOneBy({ id: groupId });
            if (!group) throw new Error("Group not found");

            // Settlement is essentially an expense paid by Debtor, where the cost is incurred entirely by the Creditor (so Creditor "consumes" the value, Debtor pays for it)
            // Wait, logic check:
            // Expense Logic: Payer pays X. Split says who consumed X.
            // If I owe you 50, I pay you 50.
            // In Expense terms: Payer = Debtor (ME). Amount = 50.
            // Who is this for? It's a transfer TO Creditor (YOU). 
            // So Split should be: { userId: Creditor, amount: 50 }.
            // Result: I pay 50. You "consumed" 50 (got 50 value).
            // Net effect: I am +50 (paid out), You are -50 (received benefit).
            // In my balance calculation: Payer gets Credit (+), Splitter gets Debit (-).
            // So if I pay 50, I get +50 credit. You get -50 debit.
            // If I owed you (-50), now I am (-50 + 50) = 0.
            // If you were owed (+50), now you are (+50 - 50) = 0.
            // This logic holds.

            const expense = new Expense();
            expense.description = "Settlement";
            expense.amount = amount;
            expense.payerId = debtorId;
            expense.splits = [{ userId: creditorId, amount: amount }];
            expense.group = group;

            return await expenseRepository.save(expense);
        }
    },
    Group: {
        expenses: async (parent: Group) => {
            const expenseRepository = AppDataSource.getRepository(Expense);
            return await expenseRepository.find({ where: { group: { id: parent.id } } });
        }
    }
};
