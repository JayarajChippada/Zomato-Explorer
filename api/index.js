import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

// import routes
import restaurantRoutes from './routes/restaurant.route.js';


const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("MongoDB is connected!");
        })
        .catch((error) => {
            console.log(error);
        })

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}!`);
});


// routes
app.use('/api/restaurants', restaurantRoutes);


// middleware
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 5000;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})