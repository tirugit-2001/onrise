import React from "react";
import CustomCarousel from "@/component/CustomCarousel/CustomCarousel";
import CategoryGrid from "../CategoryGrid/CategoryGrid";
import HeroWords from "../HeroWords/HeroWords";
import ProductSection from "../ProductSection/ProductSection";
import OfferMarquee from "@/component/OfferMarquee/OfferMarquee";

const Home = () => {
  return (
    <>
        <main>
          <OfferMarquee/>
          <CustomCarousel />
          <CategoryGrid />
          <HeroWords />
          <ProductSection />
        </main>
    </>
  );
};

export default Home;
