import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';
import { AiOutlineMenu, AiOutlineSearch } from 'react-icons/ai';
import { IoMdClose } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const [toggleButton, setToggleButton] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sideBarData, setSideBarData] = useState({
        searchTerm: '',
        cuisine: '',
        country: 30,
        latitude: '',
        longitude: '',
        radius: '',
        avgCost: 0
    });

    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setToggleButton(!toggleButton);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    };

    const handleSideBarChange = (e) => {
        setSideBarData({
            ...sideBarData,
            [e.target.id]: e.target.value
        });
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        const query = new URLSearchParams(sideBarData).toString();
        navigate(`/search?${query}&page=${1}`);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm') || '';
        setSearchTerm(searchTermFromUrl);

        setSideBarData({
            searchTerm: searchTermFromUrl,
            cuisine: urlParams.get('cuisine') || '',
            country: urlParams.get('country') || 30,
            latitude: urlParams.get('latitude') || '',
            longitude: urlParams.get('longitude') || '',
            radius: urlParams.get('radius') || '',
            avgCost: urlParams.get('avgCost') || 0
        });
    }, [location.search]);

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center max-full lg:px-28 xl:px-40 2xl:px-50 mx-auto">
            <div className="flex items-center">
                <img src={logo} alt="Logo" className="w-10 h-10 object-cover mr-2" />
                <h1 className="text-2xl font-bold text-gray-800">Zomato Explorer</h1>
            </div>
            
            <form className="relative hidden sm:block" onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Search restaurants..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 w-80 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <AiOutlineSearch className="h-5 w-5" />
                </button>
            </form>

            <div className="flex">
                {/* Mobile Search Button */}
                <button 
                    type="button" 
                    className="flex mr-4 sm:hidden items-center justify-center p-0.5 text-center font-medium relative 
                                focus:z-10 focus:outline-none text-gray-900 bg-white border border-gray-200 
                                hover:bg-slate-100 enabled:hover:bg-gray-100 enabled:hover:text-gray-800 
                                :ring-cyan-700 focus:text-gray-700 dark:bg-transparent dark:text-gray-400 
                                dark:border-gray-600 dark:enabled:hover:text-white dark:enabled:hover:bg-gray-700 
                                rounded-full focus:ring-2 lg:hidden w-12 h-10">
                    <AiOutlineSearch className='w-4 h-4'/>
                </button>
                
                {/* Toggle Menu Button */}
                <div className={`lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2
                                focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 
                                ${toggleButton ? 'border border-slate-400' : 'hover:bg-gray-100'} focus:outline-none`}>
                    <AiOutlineMenu className='cursor-pointer h-6 w-6' onClick={toggleMenu} />
                </div>
            </div>

            {/* Sidebar */}
            <div className={`lg:hidden fixed top-0 right-0 w-64 h-screen bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
                ${toggleButton ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full justify-between">
                    {/* Sidebar Header with Close Icon */}
                    <div className="flex justify-between items-center">
                        <h1 className='px-4 text-2xl font-bold'>Filters</h1>
                        <div className="flex justify-end p-4">
                            <div className={`lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2
                                    focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 
                                    ${toggleButton ? 'border border-slate-400' : 'hover:bg-gray-100'} focus:outline-none`}>
                                <IoMdClose className='cursor-pointer h-6 w-6' onClick={toggleMenu} />
                            </div>
                        </div>
                    </div>
                        
                    {/* Sidebar Content */}
                    <div className="p-4 flex-grow">
                        <form onSubmit={handleApplyFilters}>
                            <div className="mb-4">
                                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Search Term:</label>
                                <input 
                                  id="searchTerm"
                                  type="text"
                                  placeholder='Search...' 
                                  value={sideBarData.searchTerm}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm pr-10 rounded-lg'
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700">Cuisine:</label>
                                <input 
                                  id="cuisine"
                                  type="text"
                                  placeholder='Cuisine...' 
                                  value={sideBarData.cuisine}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm pr-10 rounded-lg'
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country:</label>
                                <select 
                                  id="country"
                                  value={sideBarData.country}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm rounded-lg'
                                >
                                    <option value={32}>United States</option>
                                    <option value={1}>India</option>
                                    <option value={14}>Australia</option>
                                    <option value={30}>Brazil</option>
                                    <option value={37}>Canada</option>
                                    <option value={94}>Indonesia</option>
                                    <option value={148}>New Zealand</option>
                                    <option value={162}>Phillipines</option>
                                    <option value={166}>Qatar</option>
                                    <option value={184}>Singapore</option>
                                    <option value={189}>South Africa</option>
                                    <option value={191}>Sri Lanka</option>
                                    <option value={208}>Turkey</option>
                                    <option value={214}>UAE</option>
                                    <option value={215}>United Kingdom</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude:</label>
                                <input 
                                  id="latitude"
                                  type="text"
                                  placeholder='Latitude...' 
                                  value={sideBarData.latitude}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm pr-10 rounded-lg'
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude:</label>
                                <input 
                                  id="longitude"
                                  type="text"
                                  placeholder='Longitude...' 
                                  value={sideBarData.longitude}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm pr-10 rounded-lg'
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="radius" className="block text-sm font-medium text-gray-700">Radius:</label>
                                <input 
                                  id="radius"
                                  type="text"
                                  placeholder='Radius...' 
                                  value={sideBarData.radius}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm pr-10 rounded-lg'
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="avgCost" className="block text-sm font-medium text-gray-700">Average Cost:</label>
                                <input 
                                  id="avgCost"
                                  type="text"
                                  placeholder='Average Cost...' 
                                  value={sideBarData.avgCost}
                                  onChange={handleSideBarChange}
                                  className='block w-full border bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-700 focus:ring-gray-700  
                                  p-2.5 text-sm pr-10 rounded-lg'
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
                                Apply Filters
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
