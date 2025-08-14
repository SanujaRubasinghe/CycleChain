"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { assets, cityList } from "@/public/assets/assets";

function Hero() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [today, setToday] = useState("");

  
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-14 bg-light text-center">
      <h1 className="text-4xl md:text-5xl font-semibold">Best E-Bikes on Rent</h1>

      <form className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8">
          <div className="flex flex-col items-start gap-2">
            <select
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            >
              <option value="">Pickup Location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <p className="px-1 text-sm text-gray-500">
              {pickupLocation ? pickupLocation : "Please Select Location"}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <label htmlFor="pickup-date">Pick-up Date</label>
            <input
              type="date"
              id="pickup-date"
              min={today}
              className="text-sm text-gray-500"
              required
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            <label htmlFor="return-date">Return Date</label>
            <input type="date" id="return-date" className="text-sm text-gray-500" required />
          </div>
        </div>

        <button className="flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer">
          <Image src={assets.search_icon} alt="search" width={20} height={20} className="brightness-300" />
          Search
        </button>
      </form>

      <div className="relative h-96 w-auto">
        <Image src={assets.hero} alt="car" fill className="object-contain" />
      </div>
    </div>
  );
}

export default Hero;
