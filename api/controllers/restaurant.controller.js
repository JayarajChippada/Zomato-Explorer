import { errorHandler } from '../utils/errorHandler.js';
import Restaurant from '../models/restaurant.model.js';
import Country from '../models/country.model.js';

// Helper function to get pagination options
const getPaginationOptions = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

// Preload all countries and create a map
const getCountryMap = async () => {
    const countries = await Country.find();
    const countryMap = {};
    countries.forEach(c => countryMap[c._id] = c.name);
    return countryMap;
};

// Replace country IDs with names using a map
const mapCountries = (restaurant, countryMap) => {
    const obj = restaurant.toObject();
    if (obj.location && obj.location.country) {
        obj.location.country = countryMap[obj.location.country] || "Unknown";
    }
    return obj;
};

// Get restaurant by ID
export const getRestaurantById = async (req, res, next) => {
    try {
        const countryMap = await getCountryMap();
        const restaurant = await Restaurant.findOne({ restaurantId: req.params.restaurantId });
        if (!restaurant) return next(errorHandler(404, "Restaurant not found"));
        res.status(200).json(mapCountries(restaurant, countryMap));
    } catch (err) {
        next(err);
    }
};

// Get paginated list of restaurants
export const getRestaurants = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req);
        const countryMap = await getCountryMap();

        const restaurants = await Restaurant.find().skip(skip).limit(limit);
        const totalCount = await Restaurant.countDocuments();

        const data = restaurants.map(r => mapCountries(r, countryMap));

        res.status(200).json({ totalCount, page, limit, data });
    } catch (err) {
        next(err);
    }
};

// Calculate haversine distance
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Bounding box
const calculateBoundingBox = (lat, lng, radius) => {
    const R = 6371000;
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);
    const radiusInRadians = radius / R;
    return {
        minLat: (latRad - radiusInRadians) * (180 / Math.PI),
        maxLat: (latRad + radiusInRadians) * (180 / Math.PI),
        minLng: (lngRad - radiusInRadians / Math.cos(latRad)) * (180 / Math.PI),
        maxLng: (lngRad + radiusInRadians / Math.cos(latRad)) * (180 / Math.PI)
    };
};

// Search restaurants by location
export const searchRestaurantsByLocation = async (req, res, next) => {
    try {
        const { lat, long, radius } = req.query;
        const radiusInMeters = (parseFloat(radius) || 3) * 1000;
        const { page, limit, skip } = getPaginationOptions(req);

        if (!lat || !long || isNaN(lat) || isNaN(long)) {
            return next(errorHandler(400, "Valid latitude and longitude are required"));
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(long);
        const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(latitude, longitude, radiusInMeters);

        const restaurants = await Restaurant.find({
            "location.latitude": { $gte: minLat, $lte: maxLat },
            "location.longitude": { $gte: minLng, $lte: maxLng }
        }).skip(skip).limit(limit);

        const filtered = restaurants.filter(r =>
            haversineDistance(latitude, longitude, r.location.latitude, r.location.longitude) <= radiusInMeters
        );

        if (filtered.length === 0) return res.status(200).json({ message: "No restaurants found!" });

        const countryMap = await getCountryMap();
        const data = filtered.map(r => mapCountries(r, countryMap));

        res.status(200).json({ totalCount: data.length, page, limit, data });
    } catch (err) {
        next(err);
    }
};

// Filter by country
export const filterRestaurantsByCountry = async (req, res, next) => {
    try {
        const country = await Country.findOne({ code: req.params.code });
        if (!country) return next(errorHandler(404, 'Country not found for this code'));

        const { page, limit, skip } = getPaginationOptions(req);
        const restaurants = await Restaurant.find({ "location.country": country._id }).skip(skip).limit(limit);

        if (restaurants.length === 0) return next(errorHandler(404, 'No restaurants found!'));

        const countryMap = await getCountryMap();
        const data = restaurants.map(r => mapCountries(r, countryMap));

        res.status(200).json({ totalCount: data.length, country: country.name, page, limit, data });
    } catch (err) {
        next(err);
    }
};

// Filter by average cost
export const getRestaurantsByAverageCost = async (req, res, next) => {
    try {
        const avgCost = parseFloat(req.params.avgCost);
        if (isNaN(avgCost)) return next(errorHandler(400, 'Average cost must be a number'));

        const { page, limit, skip } = getPaginationOptions(req);
        const countryCode = req.query.country;
        let countryFilter = {};
        if (countryCode) {
            const country = await Country.findOne({ code: countryCode });
            if (!country) return next(errorHandler(404, "Country not found"));
            countryFilter = { "location.country": country._id };
        }

        const restaurants = await Restaurant.find({ averageCostForTwo: avgCost, ...countryFilter }).skip(skip).limit(limit);
        if (restaurants.length === 0) return next(errorHandler(404, 'No restaurants found!'));

        const countryMap = await getCountryMap();
        const data = restaurants.map(r => mapCountries(r, countryMap));

        res.status(200).json({ totalCount: data.length, page, limit, data });
    } catch (err) {
        next(err);
    }
};

// Filter by cuisines
export const getRestaurantsByCuisines = async (req, res, next) => {
    try {
        const { cuisine } = req.query;
        if (!cuisine) return res.status(400).json({ message: 'Cuisines parameter is required' });

        const cuisinesArray = cuisine.split(',').map(c => c.trim());
        const { page, limit, skip } = getPaginationOptions(req);

        const countryCode = req.query.country;
        let countryFilter = {};
        if (countryCode) {
            const country = await Country.findOne({ code: countryCode });
            if (!country) return next(errorHandler(404, "Country not found"));
            countryFilter = { "location.country": country._id };
        }

        const restaurants = await Restaurant.find({ "cuisines.cuisine": { $in: cuisinesArray }, ...countryFilter }).skip(skip).limit(limit);
        if (restaurants.length === 0) return next(errorHandler(404, 'No restaurants found for these cuisines'));

        const countryMap = await getCountryMap();
        const data = restaurants.map(r => mapCountries(r, countryMap));

        res.status(200).json({ totalCount: data.length, page, limit, data });
    } catch (err) {
        next(err);
    }
};

// General search
export const searchRestaurants = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req);
        const searchTerm = req.query.searchTerm?.trim() || '';

        const countryCode = req.query.country;
        let countryFilter = {};
        if (countryCode) {
            const country = await Country.findOne({ code: countryCode });
            if (!country) return next(errorHandler(404, "Country not found"));
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

        if (restaurants.length === 0) return next(errorHandler(404, 'No restaurants found matching the search query'));

        const countryMap = await getCountryMap();
        const data = restaurants.map(r => mapCountries(r, countryMap));

        res.status(200).json({ totalCount: data.length, page, limit, data });
    } catch (err) {
        next(err);
    }
};
