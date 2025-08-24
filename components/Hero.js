"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { assets, cityList } from "@/public/assets/assets";

function Hero() {
  const [userLocation, setUserLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(cityList);

  useEffect(() => {
    // Get user's approximate location based on IP or browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode these coordinates
          setCurrentLocation("Near You");
        },
        (error) => {
          console.log("Location access denied or unavailable");
        }
      );
    }
  }, []);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setUserLocation(value);
    
    if (value.length > 1) {
      setShowLocationSuggestions(true);
      const filtered = cityList.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setUserLocation(location);
    setShowLocationSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    setUserLocation(currentLocation);
    setShowLocationSuggestions(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 lg:gap-12 text-center px-4 md:px-8 relative overflow-hidden bg-slate-950 pt-20 pb-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent opacity-30"></div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 lg:gap-12 max-w-4xl w-full">
        {/* Title section */}
        <div className="flex flex-col gap-5 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Find & Ride<br className="hidden sm:block" /> 
<span className="text-primary">
  E-Bikes Nearby
</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg font-light max-w-xl mx-auto">
            Reserve your e-bike in seconds. Ride now, pay later, and return anywhere.
          </p>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-2xl bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Find available e-bikes</h2>
            </div>

            {/* Location input with suggestions */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2 text-left">
                Where do you need a bike?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userLocation}
                  onChange={handleLocationChange}
                  placeholder="Enter your location or neighborhood"
                  className="w-full bg-slate-800/60 text-white px-4 py-3 pl-10 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                
                {currentLocation && (
                  <button 
                    onClick={handleUseCurrentLocation}
                    className="absolute right-3 top-3 text-xs bg-slate-700/60 text-gray-300 hover:text-white px-2 py-1 rounded-lg transition-colors"
                  >
                    Use Current Location
                  </button>
                )}
              </div>

              {/* Location suggestions dropdown */}
              {showLocationSuggestions && filteredLocations.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                  <div className="py-2">
                    {filteredLocations.map((location) => (
                      <div
                        key={location}
                        onClick={() => selectLocation(location)}
                        className="px-4 py-2.5 hover:bg-slate-700/50 cursor-pointer transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-white">{location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-slate-700/50 transition-all duration-200 group">
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Reserve Now</span>
                <span className="text-xs text-gray-400">For immediate use</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-slate-700/50 transition-all duration-200 group">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Book Later</span>
                <span className="text-xs text-gray-400">Schedule in advance</span>
              </button>
            </div>

            {/* CTA Button */}
            <button className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 font-semibold group">
              Find Available Bikes
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats and value proposition */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-xs text-gray-400 mt-1">E-Bikes Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-xs text-gray-400 mt-1">Service Access</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-xs text-gray-400 mt-1">Locations</div>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative w-full max-w-2xl mt-4">
          <Image 
            src={assets.hero} 
            alt="Modern e-bike" 
            width={800} 
            height={400}
            className="rounded-xl object-contain w-full h-auto drop-shadow-2xl animate-float"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;