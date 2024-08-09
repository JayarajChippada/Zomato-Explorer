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

router.get('/:id', getRestaurantById);
router.get('/', getRestaurants);
router.get('/search/location', searchRestaurantsByLocation)
router.get('/filter/country/:countryId', filterRestaurantsByCountry)
router.get('/filter/spend/:avgCost', getRestaurantsByAverageCost)
router.get('/filter/cuisines', getRestaurantsByCuisines)
router.get('/search', searchRestaurants);

export default router;