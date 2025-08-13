import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';
import cors from 'cors';

dotenv.config();

// import routes
import restaurantRoutes from './routes/restaurant.route.js';

const app = express();

// CORS: allow your frontend domain or '*' for testing
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB is connected!"))
  .catch((error) => console.log(error));

// Routes
app.use('/api/restaurants', restaurantRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

// Export as serverless handler for Vercel
export default serverless(app);
