"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import styles from "./search.module.scss";
import api from "@/axiosInstance/axiosInstance";
import ProductCard from "@/component/ProductCard/ProductCard";
import { useRouter } from "next/navigation";

const SearchPage = () => {
     const [categoryList, setCategoryList] = useState([]);
  const [product, setProduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
const router = useRouter()

  const getSubCategoriesList = async () => {
    try {
      const res = await api.get(
        `/v1/categories/H8SZ4VfsFXa4C9cUeonB/subcategories`,
        {
          headers: {
            "x-api-key":
              "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
          },
        }
      );

      const fetchedCategories = res?.data?.data || [];
      setCategoryList([{ id: "All", name: "All" }, ...fetchedCategories]);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const getProductList = async () => {
    try {
      const res = await api.get(
        `/v2/product/category/H8SZ4VfsFXa4C9cUeonB`,
        {
          headers: {
            "x-api-key":
              "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
          },
        }
      );
      setProduct(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    getSubCategoriesList();
    getProductList();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? product
      : product.filter((p) => p.subcategoryId === selectedCategory);

  return (
    <div className={styles.wrapper}>
        <div>
      <div className={styles.header}>
        <ChevronLeft size={22} className={styles.backIcon} onClick={() => router.push('/')}/>

        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder='Search "Trending Design"'
            className={styles.input}
          />
        </div>
        </div>
        <div className={styles.filters}>
        {categoryList.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.filterBtn} ${
              selectedCategory === cat.id ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat?.name}
          </button>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))
        ) : (
          <p className={styles.noProducts}>No products found.</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default SearchPage;
