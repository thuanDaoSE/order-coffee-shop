import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';
import type { Product } from '../types/product';
import Carousel from '../components/ui/Carousel';
import './Home.css';

export const Home = () => {
  const [menuItems, setMenuItems] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts('', 0, 6);
        setMenuItems(products.content);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full font-lato">
      {/* Hero Section */}
      <section
        id="home"
        className="h-[80vh] bg-cover bg-center flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/backgroud.jpg')" }}
      >
        <div className="bg-black bg-opacity-50 p-8 md:p-12 rounded-lg text-center">
          <h1 className="text-5xl md:text-7xl font-playfair mb-4">Discover Your Perfect Coffee</h1>
          <p className="text-lg md:text-xl mb-8">Brewed with passion, served with love.</p>
          <Link to="/menu" className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-3 md:px-8 md:py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
            Explore Our Menu
          </Link>
        </div>
      </section>

      {/* Our Specialties Section */}
      <section id="menu-preview" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair text-amber-950 mb-4">Our Specialties</h2>
            <div className="w-24 h-1 bg-amber-900 mx-auto"></div>
          </div>
          
          <Carousel>
            {menuItems.map((item, index) => (
              <div key={index} className="bg-amber-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 mb-4 flex items-center justify-center">
                  <img 
                    src={item.imageUrl || '/image.png'} 
                    alt={item.name}
                    className="h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl font-playfair text-amber-950 mb-2">{item.name}</h3>
                <p className="text-amber-900 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-amber-900">${item.variants[0]?.price.toFixed(2)}</span>
                  <button className="bg-amber-900 text-white px-4 py-2 rounded-full text-sm hover:bg-amber-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </Carousel>
          
          <div className="text-center mt-12">
            <Link to="/menu" className="inline-block border-2 border-amber-900 text-amber-900 hover:bg-amber-50 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-amber-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img 
                src="/coffee-shop.png" 
                alt="Our Coffee Shop" 
                className="rounded-xl shadow-xl w-full h-auto"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-playfair text-amber-950 mb-6">Our Story</h2>
              <p className="text-lg text-amber-900 mb-6">
                Founded in 2023, our coffee shop is dedicated to serving the finest quality coffee in a warm and welcoming environment. We source our beans from sustainable farms around the world and roast them to perfection in-house.
              </p>
              <p className="text-lg text-amber-900 mb-8">
                Our baristas are trained to craft each cup with care and precision, ensuring that every sip brings you the rich, complex flavors that coffee lovers crave.
              </p>
              <button className="bg-amber-900 hover:bg-amber-800 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300">
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};