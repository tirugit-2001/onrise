"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./otp.module.scss";

const OTPModal = ({ phoneNumber, otp, setOtp, handleVerifyOtp }) => {
  const [timer, setTimer] = useState(45);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if current one is filled
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace navigation
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      handleVerifyOtp(otpValue);
    } else {
      alert("Please enter complete OTP");
    }
  };

  return (
    <div className={styles.otpModal}>
      <h2>OTP Verification</h2>
      <p>We have sent a verification code to +91 {phoneNumber}</p>

      <div className={styles.otpBoxes}>
        {otp.map((digit, i) => (
          <input
            key={i}
            type="text"
            maxLength="1"
            value={digit}
            ref={(el) => (inputRefs.current[i] = el)}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        Verify OTP
      </button>

      <p>
        Didn’t get the OTP? Resend in <strong>{timer}s</strong>
      </p>
    </div>
  );
};

export default OTPModal;
