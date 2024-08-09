import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("MongoDB is connected!");
        })
        .catch((error) => {
            console.log(error);
        })

const app = express();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}!`);
});