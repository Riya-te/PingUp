import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import mongoose from 'mongoose';
import {inngest,functions} from './inngest/index.js';

dotenv.config(); // also missing (important if using env)

const app = express();

await connectDB();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('server is running');
}); // ✅ FIXED
app.use('/api/inngest', serve({client: inngest.client, functions})); // ✅ FIXED

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});