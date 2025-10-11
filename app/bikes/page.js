"use client"
import React, { useState } from 'react'
import Title from '@/components/Title';
import { assets, dummyCarData } from '@/public/assets/assets';
import CarCard from '@/components/CarCard';

function Cars() {
  const [input, setInput] = useState("");
  const [filteredCars, setFilteredCars] = useState(dummyCarData);

  const handleSearch = (value) => {
    setInput(value);
    if (value.trim() === "") {
      setFilteredCars(dummyCarData);
    } else {
      const filtered = dummyCarData.filter(car =>
        car.brand.toLowerCase().includes(value.toLowerCase()) ||
        car.model.toLowerCase().includes(value.toLowerCase()) ||
        car.category.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCars(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              Premium Collection
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">E-Bikes</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Explore our curated selection of premium electric bikes designed for every adventure and lifestyle
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-white/30">
                <svg className="w-6 h-6 text-gray-300 mr-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  onChange={(e) => handleSearch(e.target.value)}
                  value={input}
                  type="text"
                  placeholder="Search by brand, model, or category..."
                  className="w-full bg-transparent text-white placeholder-gray-300 outline-none text-lg"
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {["All", "Electric Bicycle", "Electric Mountain Bike", "Folding Electric Bicycle"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleSearch(filter === "All" ? "" : filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${input === filter || (filter === "All" && input === "") ? "bg-yellow-400 text-gray-800" : "bg-white/20 text-gray-300 hover:bg-white/30"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {filteredCars.length} E-Bikes Available
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Browse Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Collection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect electric bike that matches your style and needs from our premium selection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCars.map((car, index) => (
              <div key={car._id} className="group transform hover:scale-105 transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-blue-200">
                  <CarCard car={car} />
                </div>
              </div>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A7 7 0 012 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No bikes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all our available bikes.</p>
              <button
                onClick={() => handleSearch("")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Show All Bikes
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">E-Bikes</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of urban mobility with our premium electric bike collection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🔋", title: "Long Range Battery", description: "Up to 100km range on a single charge" },
              { icon: "⚡", title: "Fast Charging", description: "0-80% charge in just 2 hours" },
              { icon: "🛡️", title: "Smart Security", description: "GPS tracking and anti-theft protection" },
              { icon: "📱", title: "App Integration", description: "Control everything from your smartphone" }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Cars