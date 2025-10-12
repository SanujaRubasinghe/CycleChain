"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              About CycleChain
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Revolutionizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Urban Mobility</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed mb-8">
              We're on a mission to transform how people move through cities with sustainable, smart, and stylish electric transportation solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/bikes" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                Explore Our Bikes
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 border border-white/30">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                Our Story
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                From Vision to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Reality</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2023, CycleChain emerged from a simple observation: cities were becoming more congested, air quality was deteriorating, and people needed smarter transportation alternatives.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our founders, a team of engineers and urban planners, recognized that electric bikes could be the perfect solution - combining the efficiency of traditional bicycles with the power needed for longer commutes and hilly terrains.
              </p>
              <p className="text-lg text-gray-600">
                Today, we're proud to be at the forefront of the e-mobility revolution, providing premium electric bikes that make sustainable transportation accessible, enjoyable, and practical for everyone.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚲</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-600">
                      To democratize sustainable urban mobility through innovative electric bike technology and exceptional user experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Values</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide every decision we make and every product we create
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🌱",
                title: "Sustainability First",
                description: "Every decision we make prioritizes environmental responsibility and long-term planetary health."
              },
              {
                icon: "⚡",
                title: "Innovation Driven",
                description: "We continuously push the boundaries of what's possible in electric mobility technology."
              },
              {
                icon: "👥",
                title: "Community Focused",
                description: "We build products that serve real people and real communities, not just markets."
              },
              {
                icon: "🛡️",
                title: "Quality Obsessed",
                description: "Every component, every feature, every interaction must meet our uncompromising standards."
              },
              {
                icon: "🌍",
                title: "Global Impact",
                description: "We're working to reduce carbon emissions one ride at a time, globally."
              },
              {
                icon: "🤝",
                title: "Transparency Always",
                description: "We believe in honest communication with our customers, partners, and each other."
              }
            ].map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Making an <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Impact</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Numbers that tell our story of growth and positive change
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Happy Riders", description: "Customers who trust us" },
              { number: "50+", label: "Cities Covered", description: "Service locations worldwide" },
              { number: "2M+", label: "Miles Ridden", description: "Collective distance traveled" },
              { number: "500+", label: "Tons CO₂ Saved", description: "Environmental impact" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-blue-200">
                  <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xl font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
              Meet Our Team
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              The People Behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">CycleChain</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to transforming urban mobility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sanuja Rubasinghe",
                role: "Developer & Co-Founder",
                description: "Former Tesla engineer with a passion for sustainable transportation.",
                image: "👩‍💼"
              },
              {
                name: "Javid Mushtan",
                role: "Developer",
                description: "AI and robotics expert focused on smart mobility solutions.",
                image: "👨‍💻"
              },
              {
                name: "Inupama Caldera",
                role: "Developer",
                description: "Award-winning industrial designer creating beautiful, functional products.",
                image: "👩‍🎨"
              },
              {
                name: "Kawya Wettasinghe",
                role: "Developer",
                description: "Award-winning industrial designer creating beautiful, functional products.",
                image: "👩‍🎨"
              },
              {
                name: "Shanuka Yasanga",
                role: "Developer & Co-Founder (ක්‍රිප්ටො වංචාකරු)",
                description: "Award-winning industrial designer creating beautiful, functional products.",
                image: "👩‍🎨"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:border-purple-200">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {member.image}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center text-white max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Join the <span className="text-yellow-400">Revolution</span>?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Experience the future of urban mobility with CycleChain. Browse our collection, find your perfect e-bike, and become part of the sustainable transportation movement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/bikes" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                Shop E-Bikes
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 border border-white/30">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
