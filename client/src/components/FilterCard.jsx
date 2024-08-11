import React from 'react';

const FilterCard = ({ sideBarData, handleChange, handleApplyFilters }) => {
  return (
    <div className="sticky top-0 p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4">Filters</h3>
      <form>
        {/* Search Term */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Search Term:</label>
          <input 
            type="text"
            id="searchTerm"
            placeholder="Search..."
            value={sideBarData.searchTerm}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2.5 text-sm rounded-lg"
          />
        </div>

        {/* Cuisine */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Cuisine:</label>
          <input 
            type="text"
            id="cuisine"
            placeholder="Cuisine..."
            value={sideBarData.cuisine}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2.5 text-sm rounded-lg"
          />
        </div>

        {/* Country */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Country:</label>
          <select 
            id="country"
            value={sideBarData.country}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2.5 text-sm rounded-lg"
          >
            {/* Add options here */}
            <option value="30">Brazil</option>
            <option value="1">India</option>
            <option value="14">Australia</option>
            <option value="37">Canada</option>
            <option value="94">Indonesia</option>
            <option value="148">New Zealand</option>
            <option value="162">Phillipines</option>
            <option value="166">Qatar</option>
            <option value="184">Singapore</option>
            <option value="189">South Africa</option>
            <option value="191">Sri Lanka</option>
            <option value="208">Turkey</option>
            <option value="214">UAE</option>
            <option value="215">United Kingdom</option>
            <option value="216">United States</option>
          </select>
        </div>

        {/* Latitude */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Latitude:</label>
          <input 
            type="number"
            step="any"
            id="latitude"
            placeholder="Latitude..."
            value={sideBarData.latitude}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2.5 text-sm rounded-lg"
          />
        </div>

        {/* Longitude */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Longitude:</label>
          <input 
            type="number"
            step="any"
            id="longitude"
            placeholder="Longitude..."
            value={sideBarData.longitude}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2.5 text-sm rounded-lg"
          />
        </div>

        {/* Average Cost */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Average Cost:</label>
          <input 
            type="number"
            id="avgCost"
            placeholder="Average Cost..."
            value={sideBarData.avgCost}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2.5 text-sm rounded-lg"
          />
        </div>

        {/* Apply Filters Button */}
        <button
          type="button"
          onClick={handleApplyFilters}
          className="w-full py-2 bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}

export default FilterCard;
