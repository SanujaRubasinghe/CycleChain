"use client";

import React from 'react'
import { assets } from '@/public/assets/assets'

function Banner() {
  return (
    <div className='flex flex-col md:flex-row md:items-start items-center
    justify-between px-8 min-md:pl-14 pt-10 bg-gradient-to-r from-[#2A9C64] to-[#6FDCA5]
 
    max-w-6xl mx-3 md:mx-auto rounded-2xl overflow-hidden'>

    <div className='text-white'>
    <h2 className='text-3xl font-medium'>Ride the Best E-Bikes in Sri Lanka</h2>
    <p className='mt-2'>Experience smooth, eco-friendly, and affordable rides with our top-quality electric bicycles.</p>
    <p className='max-w-130'>
        Perfect for city commutes or leisure trips no fuel, no noise, just pure riding fun in Colombo and beyond.
        Enjoy reliable performance, easy booking, and the best prices in town.
    </p>

    <button className='px-6 py-2 bg-white hover:bg-slate-100 transition-all
    text-primary rounded-lg text-sm mt-4 cursor-pointer'>
        Rent Your E-Bike Now
    </button>
</div>


    <img src={assets.hero} alt="car" className='max-h-45 mt-10'/>

    </div>
  )
}

export default Banner