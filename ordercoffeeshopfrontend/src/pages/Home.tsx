import { Link } from 'react-router-dom';

export const Home = () => {
  // TODO: Fetch menu items from the API instead of using static data.
  const R2_BASE_URL = import.meta.env.VITE_R2_BASE_URL || 'https://7862f02525f3249fd976641daef37c16.r2.cloudflarestorage.com/coffee-product-bucket/products';
  const menuItems = [
    { name: 'Espresso', price: 3.50, description: 'Rich and bold', image: `${R2_BASE_URL}/espresso.png` },
    { name: 'Cappuccino', price: 4.50, description: 'Creamy and smooth', image: `${R2_BASE_URL}/cappuccino.png` },
    { name: 'Latte', price: 4.75, description: 'Smooth and milky', image: `${R2_BASE_URL}/latte.png` },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="home" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8">
              <h1 className="text-6xl lg:text-7xl font-bold text-amber-950 leading-tight">
                COFFEE SHOP
              </h1>
              <p className="text-xl lg:text-2xl text-amber-900 max-w-xl">
                Enjoy our premium coffee selection for both takeaway and dine-in experiences
              </p>
              <div className="flex gap-4">
                <button className="bg-amber-900 hover:bg-amber-800 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  ORDER NOW
                </button>
                <Link to="/menu" className="border-2 border-amber-900 text-amber-900 hover:bg-amber-50 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300">
                  View Full Menu
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <img 
                src="/coffeeCup.png" 
                alt="Coffee Cup" 
                className="w-80 h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu-preview" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-amber-950 mb-4">Our Specialties</h2>
            <div className="w-24 h-1 bg-amber-900 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.map((item, index) => (
              <div key={index} className="bg-amber-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 mb-4 flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-950 mb-2">{item.name}</h3>
                <p className="text-amber-900 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-amber-900">${item.price.toFixed(2)}</span>
                  <button className="bg-amber-900 text-white px-4 py-2 rounded-full text-sm hover:bg-amber-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
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
              <h2 className="text-4xl font-bold text-amber-950 mb-6">Our Story</h2>
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

      {/* Contact Section (Will be in footer) */}
      <style>{
        `.coffee-bean {
          position: absolute;
          opacity: 0.05;
          pointer-events: none;
          z-index: 0;
        }`
      }</style>
      
      {/* Decorative Coffee Beans */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="coffee-bean" style={{ top: '10%', left: '5%', fontSize: '4rem', transform: 'rotate(12deg)' }}>☕</div>
        <div className="coffee-bean" style={{ top: '30%', right: '10%', fontSize: '3rem', transform: 'rotate(-45deg)' }}>☕</div>
        <div className="coffee-bean" style={{ bottom: '20%', left: '15%', fontSize: '5rem', transform: 'rotate(45deg)' }}>☕</div>
        <div className="coffee-bean" style={{ top: '60%', right: '15%', fontSize: '3.5rem', transform: 'rotate(-12deg)' }}>☕</div>
      </div>
    </div>
  );
};