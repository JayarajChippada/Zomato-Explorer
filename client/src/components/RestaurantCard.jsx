import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  if (!restaurant) return null; // Handle case where restaurant is not provided

  // Use optional chaining and default values
  const featuredImage = restaurant.cuisines?.featured_image || 'https://b.zmtcdn.com/data/pictures/1/3700041/b77c2ed68d19c8b621908319a43e9c0b_featured_v2.jpg';
  const name = restaurant.name || 'Indian Restaurant';
  const locality = restaurant.location?.locality_verbose || 'India';
  const cuisine = restaurant.cuisines?.cuisine || 'Pizza';
  const rating = restaurant.user_rating?.aggregate_rating || '1';
  const votes = restaurant.user_rating?.votes || '0';
  const avgCost = restaurant.averageCostForTwo || '100';
  const currency = restaurant.currency || 'Rs';
  const menuUrl = restaurant.menuUrl || '#';

  const handleClick = () => {
  // Navigate using restaurantId instead of _id
      navigate(`/restaurant/${restaurant.restaurantId}`);
    };


  return (
    <div
      onClick={handleClick}
      className='my-2 flex items-center w-full mx-auto h-[230px] bg-white border border-gray-200 rounded-lg shadow md:max-w-3xl lg:max-w-3xl hover:bg-gray-100 cursor-pointer'
    >
        <div className="w-7/12 h-full">
            <img 
                className="object-cover w-full h-full rounded-tl-lg rounded-bl-lg"
                src={featuredImage} alt="Restaurant" />
        </div>
        <div className="flex flex-col justify-between p-4 w-full my-2">
            <h5 className="mb-2 text-xl font-bold tracking-tight text-black">{name}</h5>
            <p className="mb-2 text-gray-600 text-sm">{locality}</p>
            <p className="mb-2 text-gray-800 font-medium">
                {cuisine}
            </p>
            <div className="flex items-center mb-4">
                <span 
                    className="inline-block px-2 py-1 mr-2 rounded-lg border border-green-500 text-green-600 font-semibold">
                    {rating} ★
                </span>
                <span className="text-gray-600 font-bold text-sm">
                    {votes} votes
                </span>
            </div>
            <div className="flex justify-between items-center">
                <p className="mb-2 text-gray-800 font-medium">
                    Average Cost: {currency}{avgCost}
                </p>
                <a 
                    href={menuUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-auto inline-block px-4 py-2 bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-600 transition-colors">
                    View Menu
                </a>
            </div>
        </div>
    </div>
  );
};

export default RestaurantCard;
