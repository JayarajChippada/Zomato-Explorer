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
        avgCost: 0
    });

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchField, setSearchField] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);

        const searchTermFromUrl = urlParams.get('searchTerm') || '';
        const cuisineFromUrl = urlParams.get('cuisine') || '';
        const countryFromUrl = parseInt(urlParams.get('country')) || 30;
        const latitudeFromUrl = urlParams.get('latitude') || '';
        const longitudeFromUrl = urlParams.get('longitude') || '';
        const radiusFromUrl = parseFloat(urlParams.get('radius')) || 3;
        const avgCostFromUrl = parseFloat(urlParams.get('avgCost')) || 0;

        setSideBarData({
            searchTerm: searchTermFromUrl,
            cuisine: cuisineFromUrl,
            country: countryFromUrl,
            latitude: latitudeFromUrl,
            longitude: longitudeFromUrl,
            radius: radiusFromUrl,
            avgCost: avgCostFromUrl
        });


        const fetchRestaurantsByCountry = async () => {
            try {
                setLoading(true);
                const pageQuery = `page=${currentPage}&limit=10`;
                const res = await fetch(`/api/restaurants/filter/country/${countryFromUrl}?${pageQuery}`);
                const data = await res.json();
                if (res.ok) {
                    setLoading(false);
                    setErrorMessage(null);
                    setRestaurants(data.data);
                    setSearchField(data.country);
                    setTotalPages(parseInt(data.totalCount/10));
                }
                else {
                    setLoading(false);
                    setErrorMessage(res)
                    setRestaurants([])
                }
            } catch (error) {
                setLoading(false);
                setErrorMessage(error);
            }
        };

        const fetchRestaurantsByAvgCost = async () => {
            try {
                setLoading(true);
                const pageQuery = `page=${currentPage}&limit=10`;
                const res = await fetch(`/api/restaurants/filter/spend/${avgCostFromUrl}?country=${countryFromUrl}&${pageQuery}`);
                const data = await res.json();
                if (res.ok) {
                    setLoading(false);
                    setErrorMessage(null);
                    setRestaurants(data.data);
                    setTotalPages(parseInt(data.totalCount/10));
                }
                else {
                    setLoading(false);
                    setErrorMessage(res)
                    setRestaurants([])
                }
            } catch (error) {
               setErrorMessage(error)
                setLoading(false);
            }
        };

        const fetchRestaurantsBySearchTerm = async () => {
            try {
                setLoading(true);
                const searchQuery = `searchTerm=${searchTermFromUrl}`;
                const pageQuery = `page=${currentPage}&limit=10`;
                const res = await fetch(`/api/restaurants/search?country=${countryFromUrl}&${searchQuery}&${pageQuery}`);
                const data = await res.json();
                if (res.ok) {
                    setLoading(false);
                    setErrorMessage(null);
                    setRestaurants(data.data);
                    setTotalPages(parseInt(data.totalCount/10));
                }
                else {
                    setLoading(false);
                    setErrorMessage(res)
                    setRestaurants([])
                }
            } catch (error) {
                setErrorMessage(error)
                setLoading(false);
            }
        };

        const fetchRestaurantsByCuisines = async () => {
            try {
                setLoading(true);
                const cuisineQuery = `cuisine=${cuisineFromUrl}`;
                const pageQuery = `page=${currentPage}&limit=10`;
                const res = await fetch(`/api/restaurants/filter/cuisines?country=${countryFromUrl}&${cuisineQuery}&${pageQuery}`);
                const data = await res.json();
                if (res.ok) {
                    setLoading(false);
                    setErrorMessage(null);
                    setRestaurants(data.data);
                    setTotalPages(parseInt(data.totalCount/10));
                }
                else {
                    setLoading(false);
                    setErrorMessage(res)
                    setRestaurants([])
                }
            } catch (error) {
                setErrorMessage(error)
                setLoading(false);
            }
        };

        const fetchRestaurantsByLocation = async () => {
            try {
                setLoading(true);
                const pageQuery = `page=${currentPage}&limit=10`;
                const locationQuery = `lat=${latitudeFromUrl}&long=${longitudeFromUrl}&radius=${radiusFromUrl}&${pageQuery}`;
                const res = await fetch(`/api/restaurants/search/location?${locationQuery}`);
                const data = await res.json();
                if (res.ok) {
                    setLoading(false);
                    setErrorMessage(null)
                    setRestaurants(data.data);
                    setTotalPages(parseInt(data.totalCount/10));
                }
                else {
                    setLoading(false);
                    setErrorMessage(res)
                    setRestaurants([])
                }
            } catch (error) {
                setErrorMessage(error)
                setLoading(false);
            }
        };

        const fetchAllFilters = async () => {
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
            
                // Check each response and filter out any failed requests
                const data = await Promise.all(response.map(async res => {
                    if (!res.ok) {
                        console.error('Error in API call:', res.status, res.statusText);
                        return [];
                    }
                    const jsonResponse = await res.json();
                    return jsonResponse.data || []; // Extract 'data' array from the response, assuming the API follows this structure
                }));
            
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

        if (searchTermFromUrl && searchTermFromUrl !== '' 
                && cuisineFromUrl === '' 
                && avgCostFromUrl === 0 // Update this to 50 instead of 0
                && latitudeFromUrl === '' 
                && longitudeFromUrl === '') {
                    fetchRestaurantsBySearchTerm();
                    setSearchField(`${searchTermFromUrl}`)
            } else if (cuisineFromUrl && cuisineFromUrl !== '' 
                && searchTermFromUrl === '' 
                && avgCostFromUrl === 0 // Update this to 50 instead of 0
                && latitudeFromUrl === '' 
                && longitudeFromUrl === '') {
                    fetchRestaurantsByCuisines();
                    setSearchField(`Cuisine: ${cuisineFromUrl}`)
            } else if (avgCostFromUrl > 0 
                && searchTermFromUrl === '' 
                && cuisineFromUrl === '' 
                && latitudeFromUrl === '' 
                && longitudeFromUrl === '') {
                    fetchRestaurantsByAvgCost();
                    setSearchField(`Average Cost: ${avgCostFromUrl}`)
            } else if (latitudeFromUrl && longitudeFromUrl 
                && latitudeFromUrl !== '' 
                && longitudeFromUrl !== '' 
                && searchTermFromUrl === '' 
                && cuisineFromUrl === '' 
                && avgCostFromUrl === 0) { // Update this to 50 instead of 0
                    fetchRestaurantsByLocation();
                    setSearchField(`Location: ${latitudeFromUrl} & ${longitudeFromUrl}`)
            } else if (countryFromUrl
                && avgCostFromUrl === 0 // Update this to 50 instead of 0
                && searchTermFromUrl === '' 
                && cuisineFromUrl === '' 
                && latitudeFromUrl === '' 
                && longitudeFromUrl === '') {
                    fetchRestaurantsByCountry();
                    setSearchField(`Country: ${countryFromUrl}`)
            } else {
                fetchAllFilters();
                setSearchField("Filters")
            }

    }, [location.search, currentPage]);

    useEffect(() => {
        const query = new URLSearchParams(sideBarData).toString();
        window.history.replaceState(null, '', `?${query}&page=${currentPage}`);
    }, [sideBarData, currentPage]);

    const handleChange = (e) => {
        setSideBarData({
            ...sideBarData,
            [e.target.id]: e.target.value
        });
    }

    const handleApplyFilters = () => {
        const query = new URLSearchParams(sideBarData).toString();
        setCurrentPage(1);
        navigate(`/search?${query}&page=${1}`);
    }

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return; // Prevent invalid page numbers
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pages = [];
        const maxPageButtons = 3; // Maximum number of page buttons to show at the beginning

        // Always show the first page
        pages.push(
            <button
                key={1}
                onClick={() => handlePageChange(1)}
                className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500 hover:text-white`}
            >
                1
            </button>
        );

        // Show ellipsis if currentPage is beyond the maxPageButtons
        if (currentPage > maxPageButtons + 1) {
            pages.push(<span key="ellipsis1" className="px-2">...</span>);
        }

        // Calculate and display the range of page numbers
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500 hover:text-white`}
                >
                    {i}
                </button>
            );
        }

        // Show ellipsis before the last page if necessary
        if (currentPage < totalPages - maxPageButtons) {
            pages.push(<span key="ellipsis2" className="px-2">...</span>);
        }

        // Always show the last page
        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500 hover:text-white`}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

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
                ) 
                : (
                    <>
                        <h2 className="text-2xl flex items-center justify-center font-bold mb-4">
                            Search Results for "{searchField}"
                        </h2>
                        <div>
                        {errorMessage ?(
                            <p className='self-center mt-10 font-normal text-lg'>No restaurants found</p>) 
                            : (
                            <>
                                <div className="flex flex-col gap-4">
                                    {restaurants.map((restaurant) => (
                                        <RestaurantCard
                                            key={restaurant._id}
                                            restaurant={restaurant}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex gap-2 items-center">
                                        {renderPagination()}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        ) 
                        }
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchPage;
