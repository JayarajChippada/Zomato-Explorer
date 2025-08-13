import { errorHandler } from '../utils/errorHandler.js';
import Restaurant from '../models/restaurant.model.js';
import Country from '../models/country.model.js';

// function to replace country ID with country name
const replaceCountryIdWithName = async (restaurant) => {
    if (restaurant.location && restaurant.location.country) {
        const country = await Country.findById(restaurant.location.country);
        if (country) {
            restaurant.location.country = country.name;
        } else {
            restaurant.location.country = 'Unknown';
        }
    }
    return restaurant;
};

// Helper function to get pagination options
const getPaginationOptions = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

// Get restaurant by ID
export const getRestaurantById = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findOne({ restaurantId: req.params.restaurantId });
        if (!restaurant) {
            return next(errorHandler(404, "Restaurant not found"));
        }
        // Replace country ID with country name
        const restaurantWithCountryName = await replaceCountryIdWithName(restaurant.toObject());
        res.status(200).json(restaurantWithCountryName);
    } catch (err) {
        next(err);
    }
};

// Get paginated list of restaurants
export const getRestaurants = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req);

        const restaurants = await Restaurant.find().skip(skip).limit(limit);
        const totalCount = await Restaurant.countDocuments();

        // Replace country ID with country name for each restaurant
        const restaurantsWithCountryName = await Promise.all(restaurants.map(async restaurant => 
            replaceCountryIdWithName(restaurant.toObject())
        ));

        res.status(200).json({
            totalCount,
            page,
            limit,
            data: restaurantsWithCountryName
        });
    } catch (err) {
        next(err);
    }
};

// Calculate haversine distance between two points
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

// Calculate bounding box for a given radius
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

// Search restaurants by location within a radius
export const searchRestaurantsByLocation = async (req, res, next) => {
    try {
        const { lat, long } = req.query;
        const radiusInKm = parseFloat(req.query.radius) || 3;
        const radiusInMeters = radiusInKm * 1000;

        const { page, limit, skip } = getPaginationOptions(req);

        if (!lat || !long || isNaN(lat) || isNaN(long)) {
            return next(errorHandler(400, "Valid latitude and longitude are required"));
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(long);

        // Calculate bounding box
        const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(latitude, longitude, radiusInMeters);

        const restaurants = await Restaurant.find({
            "location.latitude": { $gte: minLat, $lte: maxLat },
            "location.longitude": { $gte: minLng, $lte: maxLng }
        }).skip(skip).limit(limit).exec();

        // Filter results by distance to ensure they are within the radius
        const filteredRestaurants = restaurants.filter(restaurant =>
            haversineDistance(latitude, longitude, restaurant.location.latitude, restaurant.location.longitude) <= radiusInMeters
        );

        const totalCount = filteredRestaurants.length;

        // Replace country ID with country name for each restaurant
        const restaurantsWithCountryName = await Promise.all(filteredRestaurants.map(async restaurant => 
            replaceCountryIdWithName(restaurant.toObject())
        ));

        if (restaurantsWithCountryName.length === 0) {
            return res.status(200).json({ message: "No restaurants found!" });
        }

        res.status(200).json({
            totalCount,
            page,
            limit,
            data: restaurantsWithCountryName
        });
    } catch (err) {
        next(err);
    }
};

// Filter restaurants by country
export const filterRestaurantsByCountry = async (req, res, next) => {
    try {
        const country = await Country.findOne({ code: req.params.code });
        const { page, limit, skip } = getPaginationOptions(req);

        if (!country) {
            return next(errorHandler(404, 'Country not found for this code'));
        }

        const restaurants = await Restaurant.find({ "location.country": country._id }).skip(skip).limit(limit).exec();
        const totalCount = await Restaurant.countDocuments({ "location.country": country._id });

        // Replace country ID with country name for each restaurant
        const restaurantsWithCountryName = await Promise.all(restaurants.map(async restaurant => 
            replaceCountryIdWithName(restaurant.toObject())
        ));

        if (restaurantsWithCountryName.length === 0) {
            return next(errorHandler(404, 'No restaurants found!'));
        }

        res.status(200).json({
            totalCount,
            country: country.name,
            page,
            limit,
            data: restaurantsWithCountryName
        });
    } catch (err) {
        next(err);
    }
};

// Get restaurants by average cost
export const getRestaurantsByAverageCost = async (req, res, next) => {
    try {
        const avgCost = parseFloat(req.params.avgCost);
        const { page, limit, skip } = getPaginationOptions(req);

        if (isNaN(avgCost)) {
            return next(errorHandler(400, 'Average cost must be a number'));
        }

        const countryCode = req.query.country || 1;
        let countryFilter = {};
        if (countryCode) {
            const country = await Country.findOne({ code: countryCode });
            if (!country) {
                return next(errorHandler(404, "Country not found"));
            }
            countryFilter = { "location.country": country._id };
        }

        const restaurants = await Restaurant.find({
            averageCostForTwo: avgCost,
            ...countryFilter
        }).skip(skip).limit(limit);
        const totalCount = await Restaurant.countDocuments({
            averageCostForTwo: avgCost,
            ...countryFilter
        });

        // Replace country ID with country name for each restaurant
        const restaurantsWithCountryName = await Promise.all(restaurants.map(async restaurant => 
            replaceCountryIdWithName(restaurant.toObject())
        ));

        if (restaurantsWithCountryName.length === 0) {
            return next(errorHandler(404, 'No restaurants found!'));
        }

        res.status(200).json({
            totalCount,
            page,
            limit,
            data: restaurantsWithCountryName
        });
    } catch (err) {
        next(err);
    }
};

// Get restaurants by cuisines
export const getRestaurantsByCuisines = async (req, res, next) => {
    try {
        const { cuisine } = req.query;
        const { page, limit, skip } = getPaginationOptions(req);

        if (!cuisine) {
            return res.status(400).json({ message: 'Cuisines parameter is required' });
        }

        const cuisinesArray = cuisine.split(',').map(cuisine => cuisine.trim());

        const countryCode = req.query.country;
        let countryFilter = {};
        if (countryCode) {
            const country = await Country.findOne({ code: countryCode });
            if (!country) {
                return next(errorHandler(404, "Country not found"));
            }
            countryFilter = { "location.country": country._id };
        }

        const restaurants = await Restaurant.find({
            "cuisines.cuisine": { $in: cuisinesArray },
            ...countryFilter
        }).skip(skip).limit(limit).exec();
        const totalCount = await Restaurant.countDocuments({
            "cuisines.cuisine": { $in: cuisinesArray },
            ...countryFilter
        });

        // Replace country ID with country name for each restaurant
        const restaurantsWithCountryName = await Promise.all(restaurants.map(async restaurant => 
            replaceCountryIdWithName(restaurant.toObject())
        ));

        if (restaurantsWithCountryName.length === 0) {
            return next(errorHandler(404, 'No restaurants found for these cuisines'));
        }

        res.status(200).json({
            totalCount,
            page,
            limit,
            data: restaurantsWithCountryName
        });
    } catch (err) {
        next(err);
    }
};

// Search restaurants by various fields
export const searchRestaurants = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req);
        const searchTerm = req.query.searchTerm ? req.query.searchTerm.trim() : '';

        const countryCode = req.query.country;
        let countryFilter = {};
        if (countryCode) {
            const country = await Country.findOne({ code: countryCode });
            if (!country) {
                return next(errorHandler(404, "Country not found"));
            }
            countryFilter = { "location.country": country._id };
        }

        const restaurants = await Restaurant.find({
            ...(searchTerm && { 
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { "location.city": { $regex: searchTerm, $options: 'i' } },
                    { "location.locality": { $regex: searchTerm, $options: 'i' } },
                    { "location.locality_verbose": { $regex: searchTerm, $options: 'i' } },
                ]
             }),
            ...countryFilter
        }).skip(skip).limit(limit);
        const totalCount = await Restaurant.countDocuments({
            ...(searchTerm && { 
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { "location.city": { $regex: searchTerm, $options: 'i' } },
                    { "location.locality": { $regex: searchTerm, $options: 'i' } },
                    { "location.locality_verbose": { $regex: searchTerm, $options: 'i' } },
                ]
             }),
            ...countryFilter
        });

        // Replace country ID with country name for each restaurant
        const restaurantsWithCountryName = await Promise.all(restaurants.map(async restaurant => 
            replaceCountryIdWithName(restaurant.toObject())
        ));

        if (restaurantsWithCountryName.length === 0) {
            return next(errorHandler(404, 'No restaurants found matching the search query'));
        }

        res.status(200).json({
            totalCount,
            page,
            limit,
            data: restaurantsWithCountryName
        });
    } catch (err) {
        next(err);
    }
};
