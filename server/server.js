import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';

dotenv.config();

const app = express();

// ✅ Connect DB
connectDB();

app.use(express.json());
app.use(cors());

// ✅ Test route
app.get('/', (req, res) => {
  res.send('server is running');
});

// ✅ Inngest route (FIXED)
app.use('/api/inngest', serve({ client: inngest, functions }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});