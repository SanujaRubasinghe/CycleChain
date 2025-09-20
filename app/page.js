"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(34, 197, 94, ${Math.random() * 0.4 + 0.1})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect particles with lines
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 * (1 - distance/100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-hidden relative">
      {/* Animated Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full opacity-30 z-0"
      />

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center pt-20 px-6 z-10 relative">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Sustainable Urban <span className="text-green-600">Mobility</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Rent eco-friendly electric and traditional bikes for your daily commute. 
          Affordable, convenient, and good for the planet.
        </p>
        <Link href="/reserve">
          <button className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Reserve Your Bike
          </button>
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-16 px-6 z-10 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="text-green-600 text-4xl mb-4">🚴</div>
            <h3 className="text-xl font-semibold mb-3">Eco-Friendly</h3>
            <p className="text-gray-600">Reduce your carbon footprint with our zero-emission bikes.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="text-green-600 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Electric Options</h3>
            <p className="text-gray-600">Effortless riding with our premium electric bike fleet.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="text-green-600 text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-3">Easy Reservation</h3>
            <p className="text-gray-600">Book, unlock, and ride with our simple mobile app.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gray-50 bg-opacity-70 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4">1</div>
              <p className="font-medium">Find a bike near you</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4">2</div>
              <p className="font-medium">Reserve in seconds</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4">3</div>
              <p className="font-medium">Unlock with your phone</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-4">4</div>
              <p className="font-medium">Ride and return anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 text-center z-10 relative">
        <h2 className="text-3xl font-bold mb-6">Ready to Ride?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Join thousands of urban commuters who have made the switch to sustainable transportation.
        </p>
        <Link href="/checkout">
          <button className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-medium shadow-lg">
            Get Started Today
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t bg-white bg-opacity-80 z-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              © {new Date().getFullYear()} CycleChain. All rights reserved.
            </div>
            <div className="flex space-6">
              <Link href="/privacy" className="text-gray-500 hover:text-green-600 transition mx-3">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-green-600 transition mx-3">Terms of Service</Link>
              <Link href="/contact" className="text-gray-500 hover:text-green-600 transition mx-3">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}