import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import FilterCard from '../components/FilterCard';

const Homepage = () => {
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

    const navigate = useNavigate();

    useEffect(() => {
        try {
            setLoading(true);
            const fetchAllRestaurants = async () => {
                const res = await fetch(`/api/restaurants/?page=${currentPage}`);
                const data = await res.json();
                if (res.ok) {
                    setLoading(false);
                    setRestaurants(data.data);
                    setTotalPages(parseInt(data.totalCount/10));
                }
            };
            fetchAllRestaurants();
        } catch (error) {
            console.log(error);
        }
    }, [currentPage]);

    const handleChange = (e) => {
        setSideBarData({
            ...sideBarData,
            [e.target.id]: e.target.value
        });
    };

    const handleApplyFilters = () => {
        const query = new URLSearchParams(sideBarData).toString();
        navigate(`/search/?${query}&page=${1}`);
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return; // Prevent invalid page numbers
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pages = [];
        const maxPageButtons = 2; // Maximum number of page buttons to show at the beginning

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
        <div className="flex flex-col md:flex-row xl:w-[92%] mx-auto min-h-screen">
            <div className="hidden lg:block w-full md:w-1/4 p-4">
                <FilterCard
                    sideBarData={sideBarData}
                    handleChange={handleChange}
                    handleApplyFilters={handleApplyFilters}
                />
            </div>
            <div className="w-full md:w-3/4 mx-auto p-4">
                {loading ? (
                    <div className="flex mt-15 items-center justify-center font-sm">
                        <span className="font-bold text-sm pl-3">Loading...</span>
                    </div>
                ) : (
                    <div>
                        {restaurants.length > 0 ? (
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
                        ) : (
                            <p className="text-center text-gray-600">No restaurants found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Homepage;
