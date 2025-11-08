"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ProductCard.module.scss";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ProductCard = ({ item,getwishList}) => {
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleClick = () => {
    router.push(`/product/${item?.id}`);
  };

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const res = await axios.get(`${apiUrl}/v2/wishlist/${item.id}/status`, {
          headers: {
            "x-api-key":
              "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          },
        });
        setLiked(res.data?.data?.isInWishlist || false);
      } catch (err) {
        console.error("Error checking wishlist status:", err);
      }
    };

    fetchWishlistStatus();
  }, [item.id]);

  const toggleWishlist = async () => {
    try {
      if (!liked) {
        // Add to wishlist
        await axios.post(
          `${apiUrl}/v2/wishlist`,
          { productId: item.id },
          {
            headers: {
              "x-api-key":
                "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            },
          }
        );
      } else {
        // Remove from wishlist
        const res = await axios.delete(`${apiUrl}/v2/wishlist/${item.id}`, {
          headers: {
            "x-api-key":
              "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          },
        });
        if(res?.status === 200){
          getwishList()
        }
      }

      // Toggle local state
      setLiked((prev) => !prev);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <Image
          src={item?.canvasImage}
          alt={item?.subtitle}
          width={300}
          height={300}
          className={styles.productImg}
        />
        <span
          className={`${styles.favorite} ${liked ? styles.liked : ""}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            toggleWishlist();
          }}
        >
          <Heart
            size={22}
            fill={liked ? "red" : "none"}
            stroke={liked ? "red" : "currentColor"}
          />
        </span>
      </div>

      <h3>{item?.subtitle}</h3>
      <p>₹ {item?.basePrice}</p>
    </div>
  );
};

export default ProductCard;
