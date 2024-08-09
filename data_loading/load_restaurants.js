import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import Restaurant from '../api/models/restaurant.model.js';
import Country from '../api/models/country.model.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("MongoDB is connected!");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

const results = [];

fs.createReadStream(path.join(__dirname, 'zomato.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        try {
            const restaurants = await Promise.all(results.map(async (data) => {
                const country = await Country.findOne({ code: parseInt(data['Country Code'], 10) });

                return {
                    restaurantId: parseInt(data['Restaurant ID'], 10),
                    name: data['Restaurant Name'],
                    country: country ? country._id : null,
                    city: data['City'],
                    address: data['Address'],
                    locality: data['Locality'],
                    localityVerbose: data['Locality Verbose'],
                    longitude: parseFloat(data['Longitude']),
                    latitude: parseFloat(data['Latitude']),
                    cuisines: data['Cuisines'],
                    averageCostForTwo: parseInt(data['Average Cost for two'], 10),
                    currency: data['Currency'],
                    hasTableBooking: data['Has Table booking'] === 'Yes',
                    hasOnlineDelivery: data['Has Online delivery'] === 'Yes',
                    isDelivering: data['Is delivering now'] === 'Yes',
                    switchToOrderMenu: data['Switch to order menu'] === 'Yes',
                    priceRange: parseInt(data['Price range'], 10),
                    aggregateRating: parseFloat(data['Aggregate rating']),
                    ratingColor: data['Rating color'],
                    ratingText: data['Rating text'],
                    votes: parseInt(data['Votes'], 10)
                };
            }));

            await Restaurant.insertMany(restaurants, { ordered: false });
            console.log("Restaurants loaded successfully");
        } catch (err) {
            console.error("Error loading restaurants: ", err);
        } finally {
            mongoose.disconnect();
        }
    });