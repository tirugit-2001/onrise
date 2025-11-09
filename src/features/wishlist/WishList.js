"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./wishlist.module.scss";
import ProductCard from "@/component/ProductCard/ProductCard";
import api from "@/axiosInstance/axiosInstance";

const WishList = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [wishlistData, setWishListData] = useState([]);

  const getwishList = async () => {
    try {
      const res = await api.get(`${apiUrl}/v2/wishlist`, {
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
        },
      });
      setWishListData(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getwishList();
  }, []);




  return (
    <>
      <main className={styles.wishlist_main}>
        <h1>Your WishList</h1>
        <div className={styles.cardGrid}>
          {wishlistData.length > 0 ? (
            wishlistData.map((item) => (
              <ProductCard key={item.id} item={item} getwishList={getwishList}/>
            ))
          ) : (
            <p className={styles.noProducts}>No WishList found.</p>
          )}
        </div>
      </main>
    </>
  );
};

export default WishList;
