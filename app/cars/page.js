"use client"
import React, { useState } from 'react'
import Title from '@/components/Title';
import { assets, dummyCarData } from '@/public/assets/assets';
import CarCard from '@/components/CarCard';
import Image from 'next/image';

function Cars() {

  const [input , setInput] = useState("");


  return (
    <div>
    
     <div className='flex flex-col items-center py-20 bg-light max-md:px-4'>
      <Title title='Available Bikes' subTitle='Browse our selection of premium bikes
      available for your next adventure'/>

      <div className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12
      rounded-full shadow'>
        <Image src='assets/search_icon.svg' width={16} height={16} alt='search_icon'/>

        <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" 
        placeholder='Search by make, model, or features'
        className='w-full h-full outline-none text-gray-500'/>

        <Image src='assets/filter_icon.svg' width={16} height={16} alt='filter_icon'/>

      </div>
   
     </div>

     <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
      <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {dummyCarData.length} cars</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4
      xl:px-20 max-w-7xl mx-auto'>
        {dummyCarData.map((car, index) => (
          <div key={index} className=''>
            <CarCard car={car}/>
          </div>
        ))}

      </div>

     </div>

    </div>
  )
}

export default Cars