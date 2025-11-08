"use client";
import React, { useEffect, useState } from "react";
import styles from "./selectedcategory.module.scss";
import axios from "axios";
import { useParams } from "next/navigation";
import ProductCard from "@/component/ProductCard/ProductCard";

const SelectedCategory = () => {
  const [categoryList, setCategoryList] = useState([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { slug } = useParams();
  console.log(slug, "sjsjsjsjuuu");
  const getCategoryListData = async () => {
    const res = await axios.get(
      `${apiUrl}/v2/product/collections?categoryId=H8SZ4VfsFXa4C9cUeonB&identifier=${slug}`,
      {
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
          Authorization:
           `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`
        },
      }
    );
    setCategoryList(res?.data?.data);
    console.log(res, "sjsjshyyy");
  };

  useEffect(() => {
    getCategoryListData();
  }, []);

  return (
    <>
      <div className={styles.cardGrid}>
        {categoryList?.map((item) => {
          return <ProductCard item={item} />;
        })}
      </div>
    </>
  );
};

export default SelectedCategory;
