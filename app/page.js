"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { assets, cityList, dummyCarData } from "@/public/assets/assets";
import CarCard from "@/components/CarCard";
import Testimonial from "@/components/Testimonial";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(cityList);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Ride the Future",
      subtitle: "Premium Electric Bikes",
      description: "Experience the perfect blend of technology and sustainability with our cutting-edge e-bikes.",
      image: assets.hero,
      gradient: "from-blue-600 via-purple-600 to-indigo-800"
    },
    {
      title: "Urban Mobility",
      subtitle: "Redefined",
      description: "Navigate city streets with style and efficiency. Zero emissions, maximum performance.",
      image: assets.car_image1,
      gradient: "from-green-600 via-teal-600 to-cyan-800"
    },
    {
      title: "Adventure Awaits",
      subtitle: "Explore Beyond",
      description: "Take your journey further with long-range batteries and rugged design.",
      image: assets.car_image2,
      gradient: "from-orange-600 via-red-600 to-pink-800"
    }
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation("Near You");
        },
        (error) => {
          console.log("Location access denied or unavailable");
        }
      );
    }

    // Auto-slide functionality
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
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
    <main className="overflow-hidden">
      {/* Modern Hero Section with Carousel */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} transition-all duration-1000`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/3 rounded-full blur-3xl animate-spin-slow"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {heroSlides[currentSlide].subtitle}
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  {heroSlides[currentSlide].title.split(' ').map((word, index) => (
                    <span key={index} className={index === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className="text-xl text-gray-200 max-w-lg leading-relaxed">
                  {heroSlides[currentSlide].description}
                </p>
              </div>

              {/* Search Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Find E-Bikes Near You
                  </h3>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={userLocation}
                      onChange={handleLocationChange}
                      placeholder="Enter your location..."
                      className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 px-4 py-3 pl-10 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-300 absolute left-3 top-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    
                    {currentLocation && (
                      <button 
                        onClick={handleUseCurrentLocation}
                        className="absolute right-3 top-2.5 text-xs bg-white/20 text-gray-200 hover:text-white px-2 py-1 rounded-lg transition-colors"
                      >
                        Use Current
                      </button>
                    )}

                    {/* Location suggestions */}
                    {showLocationSuggestions && filteredLocations.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden">
                        {filteredLocations.map((location) => (
                          <div
                            key={location}
                            onClick={() => selectLocation(location)}
                            className="px-4 py-2.5 hover:bg-white/20 cursor-pointer transition-colors text-gray-800 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {location}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => router.push('/cars')}
                      className="flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Find Bikes
                    </button>
                    <button 
                      onClick={() => router.push('/purchase')}
                      className="flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 border border-white/30"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-gray-300">E-Bikes Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">24/7</div>
                  <div className="text-sm text-gray-300">Service Access</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">50+</div>
                  <div className="text-sm text-gray-300">Locations</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <Image 
                  src={heroSlides[currentSlide].image} 
                  alt="E-bike" 
                  width={600} 
                  height={400}
                  className="w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Modern Featured Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              ⚡ Premium Collection
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">E-Bikes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium electric bikes designed for every adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {dummyCarData.slice(0, 6).map((car, index) => (
              <div key={car._id} className="transform hover:scale-105 transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <CarCard car={car} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={() => {router.push('/cars'); scrollTo(0,0)}}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Explore All E-Bikes
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">CycleChain</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of urban mobility with our cutting-edge features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🔋",
                title: "Long Range Battery",
                description: "Up to 100km range on a single charge"
              },
              {
                icon: "⚡",
                title: "Fast Charging",
                description: "0-80% charge in just 2 hours"
              },
              {
                icon: "🛡️",
                title: "Smart Security",
                description: "GPS tracking and anti-theft protection"
              },
              {
                icon: "📱",
                title: "App Integration",
                description: "Control everything from your smartphone"
              }
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

      {/* Original sections with modern styling */}
      <div className="bg-white">
        <Testimonial />
        <Newsletter />
        <Footer />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Main FAB */}
          <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group-hover:rotate-45">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          {/* Quick Actions Menu */}
          <div className="absolute bottom-16 right-0 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 space-y-3">
            <button 
              onClick={() => router.push('/purchase')}
              className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="font-medium">Buy E-Bike</span>
            </button>

            <button 
              onClick={() => router.push('/my-nfts')}
              className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">🏆</span>
              </div>
              <span className="font-medium">My NFTs</span>
            </button>

            <button 
              onClick={() => router.push('/cars')}
              className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Find Bikes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 left-6 w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50 opacity-80 hover:opacity-100"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
}