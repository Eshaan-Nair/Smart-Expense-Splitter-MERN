const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const connectDB=require('./config/db');
const {protect}=require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app=express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://splitsmart-mern.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

//Routes
const authRoutes=require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

//Routes->Usage
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

app.get('/', (req, res) => {
    res.json({message: 'Expense Splitter API is running!'});
});

app.get('/api/test/protected', protect, (req, res)=> {
    res.json({
        success: true,
        message: 'You are authorized',
        user: req.user
    });
});

const PORT=process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
