class TrustScoreCalculator:
    def __init__(self):
        self.base_score = 100.0
        self.min_score = 0.0
        self.max_score = 100.0

    def calculate_score(self, history: dict) -> float:
        """
        Calculate trust score based on transaction history.
        history: {
            "total_transactions": int,
            "successful_payments": int,
            "failed_payments": int,
            "defaults": int,
            "average_transaction_amount": float
        }
        """
        score = self.base_score

        # 1. Deduction for defaults (Heavy penalty)
        score -= (history.get("defaults", 0) * 20.0)

        # 2. Deduction for failed payments (Medium penalty)
        score -= (history.get("failed_payments", 0) * 5.0)

        # 3. Bonus for high volume responsible behavior (small boost)
        if history.get("successful_payments", 0) > 10:
            score += 5.0

        # 4. Cap score
        return max(self.min_score, min(self.max_score, score))

    def get_trust_level(self, score: float) -> str:
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 50:
            return "Fair"
        else:
            return "Poor"
