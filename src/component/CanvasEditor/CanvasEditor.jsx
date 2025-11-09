"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./canvas.module.scss"

const CanvasEditor = ({
  canvasImage,
  illustrationImage,
  presetText,
  fontSize = 28,
  fontColor = "red",
  fontFamily = "Arial",
  illustrationSize = "medium",
  onDesignChange, // callback to send PNG to parent
}) => {
  const canvasRef = useRef(null);
  const [text, setText] = useState(presetText || "");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const baseImg = new Image();
    const overlayImg = new Image();

    baseImg.crossOrigin = "anonymous";
    overlayImg.crossOrigin = "anonymous";

    baseImg.src = canvasImage;
    overlayImg.src = illustrationImage;

    baseImg.onload = () => {
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;

      // draw base layer
      ctx.drawImage(baseImg, 0, 0);

      overlayImg.onload = () => {
        // determine illustration scale
        const scaleMap = {
          small: 0.3,
          medium: 0.5,
          large: 0.7,
        };
        const scale = scaleMap[illustrationSize] || 0.5;

        const newWidth = canvas.width * scale;
        const aspectRatio = overlayImg.height / overlayImg.width;
        const newHeight = newWidth * aspectRatio;

        const centerX = (canvas.width - newWidth) / 2;
        const centerY = (canvas.height - newHeight) / 2 - 40;

        // draw illustration resized
        ctx.drawImage(overlayImg, centerX, centerY, newWidth, newHeight);

        // draw editable text
        drawText(ctx);

        // send PNG up to parent
        onDesignChange(canvas.toDataURL("image/png"));
      };
    };
  }, [canvasImage, illustrationImage, text, fontColor, fontFamily, fontSize, illustrationSize]);

  const drawText = (ctx) => {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height - 60);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className={styles.canvasWrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder="Edit text..."
        className={styles.textInput}
      />
    </div>
  );
};

export default CanvasEditor;
