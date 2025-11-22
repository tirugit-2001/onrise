import React from "react";
import styles from "./addtobagloader.module.scss";

const AddToBagLoader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Adding your customized design to the bag....</p>
    </div>
  );
};

export default AddToBagLoader;
