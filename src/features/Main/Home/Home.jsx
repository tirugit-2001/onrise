import React from "react";
import CustomCarousel from "@/component/CustomCarousel/CustomCarousel";
import CategoryGrid from "../CategoryGrid/CategoryGrid";
import HeroWords from "../HeroWords/HeroWords";
import ProductSection from "../ProductSection/ProductSection";

const Home = () => {
  return (
    <>
        <main>
          <CustomCarousel />
          <CategoryGrid />
          <HeroWords />
          <ProductSection />
        </main>
    </>
  );
};

export default Home;
