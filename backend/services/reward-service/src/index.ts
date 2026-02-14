import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/rewards/:userId', (req, res) => {
    res.json({ userId: req.params.userId, points: 100, badges: ['GoldPayer'] });
});

const PORT = 4003;
app.listen(PORT, () => {
    console.log(`Reward Service running on port ${PORT}`);
});
