"use client";

import React from 'react'

function Title({title,subTitle,align}) {
  return (
    <div className={`flex flex-col justify-center items-center
    text-center ${align === "left" && "md:items-start md:text-left"}`}>
        <h1 className='font-semibold text-3xl'>{title}</h1>
        <p className='text-sm md:text-base text-gray-500/90 mt-2
        max-2-156'>{subTitle}</p>

    </div>
  )
}

export default Title