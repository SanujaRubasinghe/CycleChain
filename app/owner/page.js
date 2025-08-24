"use client";
import { useEffect, useState } from "react";
import { assets, dummyDashboardData } from "@/public/assets/assets";
import Title from "@/components/Title";
import Image from "next/image";

export default function DashboardPage() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";

  const [data, setData] = useState({
    totalCars: 0,
    totalBooking: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  });

  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored },
    { title: "Total Bookings", value: data.totalBooking, icon: assets.listIconColored },
    { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored },
  ];

  useEffect(() => {
    setData(dummyDashboardData);
  }, []);

  return (
    <div className="px-4 pt-8 md:px-10 flex-1 text-gray-100">
      <Title
        title="Admin Dashboard"
        subTitle="Monitor platform performance at a glance"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-8">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-primary/50 transition-all"
          >
            <div>
              <p className="text-xs text-gray-400">{card.title}</p>
              <p className="text-xl font-bold text-white">{card.value}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
              <Image src={card.icon} alt="" width={20} height={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings + Monthly Revenue */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Recent Bookings */}
        <div className="p-4 md:p-6 border border-slate-700 bg-slate-800 rounded-2xl flex-1">
          <h1 className="text-lg font-semibold text-white">Recent Bookings</h1>
          <p className="text-sm text-gray-400">Latest customer activities</p>
          <div className="mt-4 space-y-4 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {data.recentBookings.map((booking, index) => (
              <div
                key={index}
                className="flex items-center justify-between pb-3 border-b border-slate-700 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                    <Image src={assets.listIconColored} alt="" width={20} height={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">
                      {booking.car.brand} {booking.car.model}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.createdAt.split("T")[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-200">
                    {currency}
                    {booking.price}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === "Confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : booking.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 md:p-6 border border-slate-700 bg-slate-800 rounded-2xl md:w-80">
          <h1 className="text-lg font-semibold text-white">Monthly Revenue</h1>
          <p className="text-sm text-gray-400">This month’s earnings</p>
          <p className="text-4xl mt-6 font-bold text-primary">
            {currency}
            {data.monthlyRevenue}
          </p>
          <p className="text-xs text-gray-500 mt-2">Updated daily</p>
        </div>
      </div>
    </div>
  );
}
