import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
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
    console.log(error);
});

const results = [];
fs.createReadStream(path.join(__dirname, 'Country-Code.csv'))
    .pipe(csv())
    .on('data', (data) => {
        results.push({
            code: parseInt(data['Country Code'], 10),
            name: data['Country']
        });
    })
    .on('end', async() => {
        try{
            await Country.insertMany(results, { ordered: false });
            console.log("Countries loaded successfully");
        } catch(err) {
            console.log("Error loading countries: ", err);
        } finally {
            mongoose.disconnect();
        }
    })
