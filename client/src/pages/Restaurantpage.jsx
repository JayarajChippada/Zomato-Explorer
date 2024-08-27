import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaUtensils, FaClock } from 'react-icons/fa';
import { BsTable, BsFillCartCheckFill } from 'react-icons/bs';

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        if (!response.ok) {
          throw new Error('Restaurant not found');
        }
        const data = await response.json();
        setRestaurant(data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span className="font-bold text-lg pl-3">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-red-500 font-bold">{error}</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 font-bold">Restaurant not found</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Image Section */}
      <div className="mb-4">
        <img src={restaurant.cuisines.featured_image} alt={restaurant.name} className="w-full h-80 object-cover rounded-lg"/>
      </div>

      {/* Restaurant Info */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold mb-4">{restaurant.name}</h1>
        <h1 className="text-2xl font-bold mb-4">{restaurant.location.country}</h1>
      </div>

      {/* Cards Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Cuisine Card */}
        <div className="bg-white p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Cuisine</h2>
          <p className="text-lg font-semibold">{restaurant.cuisines.cuisine}</p>
        </div>

        {/* Average Cost Card */}
        <div className="bg-white p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">Average Cost for Two</h2>
          <div className="p-4 bg-blue-100 border rounded-lg">
            <p className="text-2xl font-bold">{restaurant.currency} {restaurant.averageCostForTwo}</p>
          </div>
        </div>

        {/* Table Booking Card */}
        <div className="bg-white p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Table Booking</h2>
          <div className="flex items-center gap-4">
            <BsTable className="text-green-500 text-3xl mr-2"/>
            <p className='p-2'>{restaurant.hasTableBooking ? 'Available' : 'Not Available'}</p>
          </div>
        </div>

        {/* Delivery Status Card */}
        <div className="bg-white p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Delivery Status</h2>
          <div className="flex items-center gap-4">
            <BsFillCartCheckFill className="text-red-500 text-3xl mr-2"/>
            <p className='p-2'>{restaurant.isDelivering ? 'Available' : 'Not Available'}</p>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Location</h2>
          <div className="flex items-center gap-4">
            <FaMapMarkerAlt className="text-yellow-500 text-3xl mr-2"/>
            <p className='p-2 font-semibold'>{restaurant.location.address}, {restaurant.location.city}</p>
          </div>
        </div>

        {/* User Rating Card */}
        <div className="bg-white p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-bold mb-2">User Rating</h2>
          <div className="p-4 bg-green-100 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-semibold">{restaurant.user_rating.aggregate_rating} ★</p>
                <p className='font-semibold'>{restaurant.user_rating.rating_text}</p>
              </div>
              <p className='font-semibold'>{restaurant.user_rating?.votes || '0'} Votes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu URL */}
      <div className="mt-6 flex items-center justify-center mx-auto">
        <a href={restaurant.menuUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center  px-4 py-2 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition-colors">
          View Menu
        </a>
      </div>
    </div>
  );
};

export default RestaurantPage;
