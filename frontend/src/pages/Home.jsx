import React from 'react';
import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import FlashSales from '../components/home/FlashSales';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Brands from '../components/home/Brands';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      <FlashSales />
      <FeaturedProducts />
      <Brands />
    </div>
  );
};

export default Home;
