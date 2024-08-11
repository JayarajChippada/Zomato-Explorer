import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Country from '../api/models/country.model.js';
import Restaurant from '../api/models/restaurant.model.js';

dotenv.config();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Function to load JSON file
async function loadJsonFile(filePath) {
  try {
    const rawData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading file:', err);
    throw err;
  }
}

// Function to clean restaurant data
function cleanRestaurantData(restaurants) {
  return restaurants.map(item => {
    const restaurant = item.restaurant || {};
    const cleanedRestaurant = Object.keys(restaurant)
      .filter(key => !['R', 'zomato_events', 'events_url', 'establishment_types'].includes(key))
      .reduce((obj, key) => {
        obj[key] = restaurant[key];
        return obj;
      }, {});
    return cleanedRestaurant;
  });
}

// Function to upload data to MongoDB
async function uploadData(cleanedData) {
  for (const data of cleanedData) {
    try {
      // Find or create the country
      let country = await Country.findOne({ code: data.location.country_id });
      if (!country) {
        country = new Country({
          code: data.location.country_id,
          name: data.location.country_name || 'Unknown'
        });
        await country.save();
      }

      // Create or update the Restaurant document
      await Restaurant.updateOne(
        { restaurantId: parseInt(data.id, 10) },
        {
          $set: {
            name: data.name,
            cuisines: {
              cuisine: data.cuisines,
              featured_image: data.featured_image || 'https://b.zmtcdn.com/data/pictures/2/2100702/899270f0b6aa0e407c846d39c054c91c_featured_v2.jpg'
            },
            averageCostForTwo: data.average_cost_for_two,
            currency: data.currency,
            hasTableBooking: data.has_table_booking === 1,
            hasOnlineDelivery: data.has_online_delivery === 1,
            isDelivering: data.is_delivering_now === 1,
            switchToOrderMenu: data.switch_to_order_menu === 1,
            priceRange: data.price_range,
            menuUrl: data.menu_url,
            location: {
              latitude: parseFloat(data.location.latitude),
              longitude: parseFloat(data.location.longitude),
              address: data.location.address,
              city: data.location.city,
              city_id: data.location.city_id,
              country: country._id,
              locality: data.location.locality,
              locality_verbose: data.location.locality_verbose,
              zipcode: data.location.zipcode
            },
            user_rating: {
              rating_text: data.user_rating.rating_text,
              rating_color: data.user_rating.rating_color,
              votes: parseInt(data.user_rating.votes, 10),
              aggregate_rating: parseFloat(data.user_rating.aggregate_rating)
            }
          }
        },
        { upsert: true } // Create if it does not exist
      );

    } catch (err) {
      console.error('Error processing restaurant data:', err);
    }
  }

  console.log('Data uploaded successfully');
}

async function main() {
  // Corrected path to the JSON file
  const filePath = path.join('E:', 'ZomatoExplorer', 'data_loading', 'file2.json'); // Use path module

  try {
    const jsonData = await loadJsonFile(filePath);

    // Extract and clean the restaurant data
    const restaurants = jsonData.flatMap(item => item.restaurants || []);
    const cleanedData = cleanRestaurantData(restaurants);

    if (cleanedData.length > 0) {
      await uploadData(cleanedData);
    } else {
      console.log('No valid data to upload');
    }
  } catch (err) {
    console.error('Error in main function:', err);
  } finally {
    mongoose.disconnect();
  }
}

// Connect to MongoDB using environment variables
const mongoURI = process.env.MONGODB_URL;

if (!mongoURI) {
  console.error('MongoDB connection string is missing.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected');
    main().catch(console.error);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
