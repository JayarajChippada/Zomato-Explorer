import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import FilterCard from '../components/FilterCard';

const SearchPage = () => {
    const [sideBarData, setSideBarData] = useState({
        searchTerm: '',
        cuisine: '',
        country: 30,
        latitude: '',
        longitude: '',
        radius: 3,
        avgCost: 50
    });

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);

        const searchTermFromUrl = urlParams.get('searchTerm') || '';
        const cuisineFromUrl = urlParams.get('cuisine') || '';
        const countryFromUrl = urlParams.get('country') || 30;
        const latitudeFromUrl = urlParams.get('latitude') || '';
        const longitudeFromUrl = urlParams.get('longitude') || '';
        const radiusFromUrl = urlParams.get('radius') || 3;
        const avgCostFromUrl = urlParams.get('avgCost') || 50;

        setSideBarData({
            searchTerm: searchTermFromUrl,
            cuisine: cuisineFromUrl,
            country: countryFromUrl,
            latitude: latitudeFromUrl,
            longitude: longitudeFromUrl,
            radius: radiusFromUrl,
            avgCost: avgCostFromUrl
        });

        const fetchRestaurants = async () => {
            setLoading(true);

            try {
                const searchQuery = `searchTerm=${searchTermFromUrl}`;
                const countryQuery = `code=${countryFromUrl}`;
                const avgCostQuery = `avgCost=${avgCostFromUrl}`;

                // Initialize an array to hold the promises for API calls
                let apiCalls = [
                    fetch(`/api/restaurants/search?${searchQuery}`),
                    fetch(`/api/restaurants/filter/country/${countryFromUrl}`),
                    fetch(`/api/restaurants/filter/spend/${avgCostFromUrl}`)
                ];

                // Conditionally add API call for cuisine if not empty
                if (cuisineFromUrl) {
                    const cuisineQuery = `cuisine=${cuisineFromUrl}`;
                    apiCalls.push(fetch(`/api/restaurants/filter/cuisines?${cuisineQuery}`));
                }

                // Conditionally add API call for location if latitude and longitude are not empty
                if (latitudeFromUrl && longitudeFromUrl) {
                    const locationQuery = `lat=${latitudeFromUrl}&long=${longitudeFromUrl}&radius=${radiusFromUrl}`;
                    apiCalls.push(fetch(`/api/restaurants/search/location?${locationQuery}`));
                }

                const response = await Promise.all(apiCalls);

                const data = await Promise.all(response.map(res => res.json()));

                // Combine all restaurant data from different responses
                const combinedData = data.flat();

                // Remove duplicates based on a unique property (e.g., restaurantId)
                const uniqueRestaurants = Array.from(new Set(combinedData.map(item => item.restaurantId)))
                    .map(id => combinedData.find(item => item.restaurantId === id));

                setRestaurants(uniqueRestaurants);
            } catch (error) {
                console.error('Error fetching restaurant data:', error);
            }

            setLoading(false);
        };

        fetchRestaurants();
    }, [location.search]);

    useEffect(() => {
        // Update the URL when sideBarData changes
        const query = new URLSearchParams(sideBarData).toString();
        window.history.replaceState(null, '', `?${query}`);
    }, [sideBarData]);

    const handleChange = (e) => {
        setSideBarData({
            ...sideBarData,
            [e.target.id]: e.target.value
        });
    }

    const handleApplyFilters = () => {
        const query = new URLSearchParams(sideBarData).toString();
        navigate(`?${query}`);
    }

    // Extract search term from URL for the header
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';

    return (
        <div className="flex flex-col md:flex-row xl:w-[92%] mx-auto">
            <div className="hidden lg:block w-full md:w-1/4 p-4">
                <FilterCard 
                    sideBarData={sideBarData} 
                    handleChange={handleChange} 
                    handleApplyFilters={handleApplyFilters} 
                />
            </div>
            <div className="w-full md:w-3/4 mx-auto p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl font-normal">Loading...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl flex items-center justify-center font-bold mb-4">
                            Search Results for "{searchTermFromUrl}"
                        </h2>
                        <div className="flex flex-col gap-4">
                            {restaurants.length === 0 ? (
                                <p>No results found.</p>
                            ) : (
                                restaurants.map((restaurant) => (
                                    <RestaurantCard 
                                        key={restaurant._id} // Ensure each RestaurantCard has a unique key
                                        restaurant={restaurant} 
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchPage;
