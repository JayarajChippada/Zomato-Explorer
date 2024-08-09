import mongoose from 'mongoose';
import Country from './country.model.js';

const restaurantSchema = new mongoose.Schema({
    restaurantId: {
        type: Number,
        required: true,
        unique: true
    },
    name: { type: String },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    city: { type: String },
    address: { type: String },
    locality: { type: String },
    localityVerbose: { type: String },
    longitude: { type: Number },
    latitude: { type: Number },
    cuisines: { type: String },
    averageCostForTwo: { type: Number },
    currency: { type: String },
    hasTableBooking: { type: Boolean },
    hasOnlineDelivery: { type: Boolean },
    isDelivering: { type: Boolean },
    switchToOrderMenu: { type: Boolean },
    priceRange: { type: Number },
    aggregateRating: { type: Number },
    ratingColor: { type: String },
    ratingText: { type: String },
    votes: { type: Number }
});

const Restaurant = mongoose.model("Restaurants", restaurantSchema);
export default Restaurant;