import mongoose from 'mongoose';
import Country from './country.model.js';

const locationSchema = new mongoose.Schema({
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    city: { type: String },
    city_id: { type: Number },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    locality: { type: String },
    locality_verbose: { type: String },
    zipcode: { type: String }
})

const cuisineSchema = new mongoose.Schema({
    cuisine: { type: String },
    featured_image: { type: String }
})

const UserRatingSchema = new mongoose.Schema({
  rating_text: { type: String },
  rating_color: { type: String },
  votes: { type: Number },
  aggregate_rating: { type: Number }
});

const restaurantSchema = new mongoose.Schema({
    restaurantId: {
        type: Number,
        required: true,
        unique: true
    },
    name: { type: String },
    cuisines: cuisineSchema,
    averageCostForTwo: { type: Number },
    currency: { type: String },
    hasTableBooking: { type: Boolean },
    hasOnlineDelivery: { type: Boolean },
    isDelivering: { type: Boolean },
    switchToOrderMenu: { type: Boolean },
    priceRange: { type: Number },
    menuUrl: { type: String },
    location: locationSchema,
    user_rating: UserRatingSchema
});

const Restaurant = mongoose.model("Restaurants", restaurantSchema);
export default Restaurant;