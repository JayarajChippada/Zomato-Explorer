import express from 'express';
import { 
    getRestaurantById, 
    getRestaurants, 
    searchRestaurantsByLocation,
    filterRestaurantsByCountry,
    getRestaurantsByAverageCost,
    getRestaurantsByCuisines,
    searchRestaurants 
} from '../controllers/restaurant.controller.js';

const router = express.Router();

router.get('/search/location', searchRestaurantsByLocation);
router.get('/filter/country/:code', filterRestaurantsByCountry);
router.get('/filter/spend/:avgCost', getRestaurantsByAverageCost);
router.get('/filter/cuisines', getRestaurantsByCuisines);
router.get('/search', searchRestaurants);
router.get('/:restaurantId', getRestaurantById);  // Less specific routes after more specific ones
router.get('/', getRestaurants);

export default router;