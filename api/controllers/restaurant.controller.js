import { errorHandler } from '../utils/errorHandler.js';
import Restaurant from '../models/restaurant.model.js';
import Country from '../models/country.model.js';

export const getRestaurantById = async(req, res, next) => {
    try{
        const restaurant = await Restaurant.findOne({restaurantId: req.params.id});
        if(!restaurant) {
            return next(errorHandler(404, "Restaurant not found"));
        }
        res.status(200).json(restaurant);
    } catch(err) {
        next(err);
    }
}

export const getRestaurants = async(req, res, next) => {
    try{
        const page = (req.query.page) || 1;
        const limit = (req.query.limit) || 10;
        const skip = (page-1)*limit;

        const restaurants = await Restaurant.find().skip(skip).limit(limit);
        const totalCount = await Restaurant.countDocuments();

        res.status(200).json({
            totalCount,
            page,
            limit,
            data: restaurants
        });
    } catch(err) {
        next(err);
    }
}

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radius of the Earth in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Calculate the bounding box for a given radius
const calculateBoundingBox = (lat, lng, radius) => {
    const R = 6371000; // Radius of Earth in meters
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);

    const radiusInRadians = radius / R;

    const minLat = latRad - radiusInRadians;
    const maxLat = latRad + radiusInRadians;

    const minLng = lngRad - radiusInRadians / Math.cos(latRad);
    const maxLng = lngRad + radiusInRadians / Math.cos(latRad);

    return {
        minLat: minLat * (180 / Math.PI),
        maxLat: maxLat * (180 / Math.PI),
        minLng: minLng * (180 / Math.PI),
        maxLng: maxLng * (180 / Math.PI)
    };
};

export const searchRestaurantsByLocation = async(req, res, next) => {
    try{
        const { lat, long } = req.query;
        const radiusInKm = parseFloat(req.query.radius) || 3;
        const radiusInMeters = radiusInKm * 1000;

        if(!lat || !long ||  lat === "" || long === "" ) {
            return next(errorHandler(400, "Latitude, Longitude are required"));
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(long);

        // Calculate bounding box
        const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(latitude, longitude, radiusInMeters);


        const restaurants = await Restaurant.find({
            latitude: { $gte: minLat, $lte: maxLat },
            longitude: { $gte: minLng, $lte: maxLng }
        }).exec();

        // Filter results by distance to ensure they are within the radius
        const filteredRestaurants = restaurants.filter(restaurant => 
            haversineDistance(latitude, longitude, restaurant.latitude, restaurant.longitude) <= radiusInMeters
        );

        if(filteredRestaurants.length === 0) res.status(200).json({
            message: "No restaurants found!"
        })
        res.status(200).json(filteredRestaurants);
    } catch(err) {
        next(err);
    }
}

export const filterRestaurantsByCountry = async(req, res, next) => {
    try{
        const countryCode = req.params.countryId;
        if(!countryCode) {
            return next(errorHandler(400, "Country code is required"));
        }

        const country = await Country.findOne({ code: countryCode });

        if (!country) {
            return next(errorHandler(404, 'Country not found for this code'));
        }

         const restaurants = await Restaurant.find({ country: country._id }).exec();

        if (restaurants.length === 0) {
            return next(errorHandler(404, 'No restaurants found for this country'));
        }

        res.status(200).json({
            country: country.name,
            restaurants
        });
    } catch(err) {
        next(err);
    }
}

export const getRestaurantsByAverageCost = async(req, res, next) => {
    try{
        const restaurants = await Restaurant.find({ averageCostForTwo: req.params.avgCost });
        if (restaurants.length === 0) {
            return next(errorHandler(404, 'No restaurants found for this country'));
        }
        res.status(200).json(restaurants);
    } catch(err) {
        next(err);
    }
}

export const getRestaurantsByCuisines = async (req, res, next) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Cuisines parameter is required' });
        }

        const cuisinesArray = query.split(',').map(cuisine => cuisine.trim());

        const restaurants = await Restaurant.find({
            cuisines: { $in: cuisinesArray }
        }).exec();

        if (restaurants.length === 0) {
            return next(errorHandler(404, 'No restaurants found for these cuisines'));
        }

        res.status(200).json(restaurants);
    } catch (err) {
        next(err);
    }
};

export const searchRestaurants = async (req, res, next) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const regex = new RegExp(query, 'i'); 

        const restaurants = await Restaurant.find({
            $or: [
                { name: { $regex: regex } }
            ]
        }).exec();

        if (restaurants.length === 0) {
            return next(errorHandler(404, 'No restaurants found matching the search query'));
        }

        // Send the results
        res.status(200).json(restaurants);
    } catch (err) {
        next(err);
    }
};