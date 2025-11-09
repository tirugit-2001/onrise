"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import styles from "./canvas.module.scss";

const FONTS = [
  { id: "f1", name: "Arial", css: "Arial, sans-serif" },
  { id: "f2", name: "Times", css: "'Times New Roman', serif" },
  { id: "f3", name: "Comic", css: "'Comic Sans MS', cursive" },
  { id: "f4", name: "Impact", css: "Impact, fantasy" },
  { id: "f5", name: "Lobster", css: "'Lobster', cursive" },
];

export default function CanvasEditor({ shirtUrl, onDesignReady }) {
  const canvasRef = useRef(null);
  const editDivRef = useRef(null);
  const wrapperRef = useRef(null);

  const [shirtImg, setShirtImg] = useState(null);
  const [font, setFont] = useState(FONTS[0]);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(30);
  const [text, setText] = useState("Mini Knight.\nMega Might!");
  const [textX, setTextX] = useState(250);
  const [textY, setTextY] = useState(420);
  const [dragging, setDragging] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [charCount, setCharCount] = useState(0);

  /* ------------------------------------------------- */
  /* Load shirt image */
  /* ------------------------------------------------- */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = shirtUrl || "";
    img.onload = () => setShirtImg(img);
    img.onerror = () => setShirtImg(null);
  }, [shirtUrl]);

  /* ------------------------------------------------- */
  /* Draw canvas (skip text while editing) */
  /* ------------------------------------------------- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 500, 600);

    if (shirtImg) {
      ctx.drawImage(shirtImg, 0, 0, 500, 600);
    } else {
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(0, 0, 500, 600);
    }

    if (!editing) {
      ctx.font = `${size}px ${font.css}`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = text.split("\n");
      const lineHeight = size * 1.2;
      lines.forEach((line, i) => {
        ctx.fillText(
          line,
          textX,
          textY + i * lineHeight - ((lines.length - 1) * lineHeight) / 2
        );
      });
    }
  }, [shirtImg, text, font, color, size, textX, textY, editing]);

  useEffect(() => draw(), [draw]);

  /* ------------------------------------------------- */
  /* Start editing – fill the editor with current text */
  /* ------------------------------------------------- */
  const startEdit = useCallback(() => {
    setEditing(true);
    setToolbarOpen(true);
    setCharCount(text.replace(/\n/g, "").length);

    // disable canvas interaction
    if (wrapperRef.current) wrapperRef.current.style.pointerEvents = "none";

    // set text **once** (after render)
    requestAnimationFrame(() => {
      if (editDivRef.current) {
        editDivRef.current.textContent = text;
        editDivRef.current.focus();

        // cursor at the end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(editDivRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }, [text]);

  /* ------------------------------------------------- */
  /* Finish editing – save text */
  /* ------------------------------------------------- */
  const finishEdit = useCallback(() => {
    if (editDivRef.current) {
      const raw = editDivRef.current.innerText.replace(/\n$/, "");
      const clean = raw.slice(0, 40);
      setText(clean);
      setCharCount(clean.replace(/\n/g, "").length);
    }
    setEditing(false);
    if (wrapperRef.current) wrapperRef.current.style.pointerEvents = "auto";
  }, []);

  /* ------------------------------------------------- */
  /* Character limit */
  /* ------------------------------------------------- */
  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finishEdit();
      return;
    }
    const cur = editDivRef.current?.innerText || "";
    const noNL = cur.replace(/\n/g, "");
    if (noNL.length >= 40 && e.key !== "Backspace" && e.key !== "Delete") {
      e.preventDefault();
    }
  };

  const handleEditInput = () => {
    if (editDivRef.current) {
      const noNL = editDivRef.current.innerText.replace(/\n/g, "");
      setCharCount(noNL.length);
    }
  };

  /* ------------------------------------------------- */
  /* Unified mouse + touch handling */
  /* ------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let startX = 0,
      startY = 0;
    let tapCount = 0;
    let lastTapTime = 0;
    const DOUBLE_TAP_DELAY = 300;

    const getPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const startHandler = (e) => {
      const { x, y } = getPointer(e);
      startX = x;
      startY = y;

      // drag start
      if (Math.hypot(x - textX, y - textY) < 80) {
        isDragging = true;
        e.preventDefault();
      }

      // tap detection
      const now = Date.now();
      if (now - lastTapTime < DOUBLE_TAP_DELAY) tapCount++;
      else tapCount = 1;
      lastTapTime = now;

      setTimeout(() => {
        if (tapCount === 2) {
          startEdit(); // double‑tap → edit
        } else if (tapCount === 1) {
          // single tap → toolbar
          const lines = text.split("\n");
          const lineHeight = size * 1.2;
          const totalH = lines.length * lineHeight;
          const textTop = textY - totalH / 2;
          const textBottom = textY + totalH / 2;
          const textLeft = textX - 200;
          const textRight = textX + 200;

          if (x > textLeft && x < textRight && y > textTop && y < textBottom) {
            setToolbarOpen(true);
          }
        }
        tapCount = 0;
      }, DOUBLE_TAP_DELAY);
    };

    const moveHandler = (e) => {
      if (!isDragging) return;
      const { x, y } = getPointer(e);
      setTextX(x);
      setTextY(y);
      e.preventDefault();
    };

    const endHandler = () => {
      isDragging = false;
    };

    /* mouse */
    canvas.addEventListener("mousedown", startHandler);
    canvas.addEventListener("mousemove", moveHandler);
    canvas.addEventListener("mouseup", endHandler);

    /* touch */
    canvas.addEventListener("touchstart", startHandler, { passive: false });
    canvas.addEventListener("touchmove", moveHandler, { passive: false });
    canvas.addEventListener("touchend", endHandler);

    return () => {
      canvas.removeEventListener("mousedown", startHandler);
      canvas.removeEventListener("mousemove", moveHandler);
      canvas.removeEventListener("mouseup", endHandler);
      canvas.removeEventListener("touchstart", startHandler);
      canvas.removeEventListener("touchmove", moveHandler);
      canvas.removeEventListener("touchend", endHandler);
    };
  }, [textX, textY, size, text, toolbarOpen, startEdit]);

  /* ------------------------------------------------- */
  /* Export */
  /* ------------------------------------------------- */
  const exportDesign = () => {
    const dataUrl = canvasRef.current?.toDataURL("image/png") || "";
    onDesignReady?.(dataUrl);
  };

  /* ------------------------------------------------- */
  /* Render */
  /* ------------------------------------------------- */
  return (
    <div className={styles.canvasSection}>
      <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={600}
          className={styles.canvas}
          style={{
            cursor: dragging ? "grabbing" : "grab",
            border: "1px solid #ddd",
            borderRadius: "10px",
            touchAction: "none",
          }}
        />

        {/* ----- Inline editor (contenteditable) ----- */}
        {editing && (
          <div
            ref={editDivRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={finishEdit}
            onKeyDown={handleEditKeyDown}
            onInput={handleEditInput}
            style={{
              position: "absolute",
              left: `${textX - 150}px`,
              top: `${textY - (size * 1.2 * (text.split("\n").length - 1)) / 2}px`,
              width: "300px",
              fontSize: `${size}px`,
              fontFamily: font.css,
              color,
              textAlign: "center",
              lineHeight: "1.2",
              background: "rgba(255,255,255,0.85)",
              border: "2px dashed #f9cc50",
              outline: "none",
              padding: "4px",
              cursor: "text",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              userSelect: "text",
            }}
            // **no dangerouslySetInnerHTML** – we fill it in startEdit()
          />
        )}
      </div>

      {/* Font tabs */}
      <div className={styles.fontTabs}>
        {FONTS.map((f, i) => (
          <button
            key={f.id}
            className={`${styles.fontTab} ${font.id === f.id ? styles.active : ""}`}
            onClick={() => setFont(f)}
            style={{ fontFamily: f.css }}
          >
            Font {i + 1}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {toolbarOpen && (
        <div className={styles.bottomToolbar}>
          <div className={styles.toolbarGroup}>
            {/* Size */}
            <div className={styles.toolItem}>
              <span className={styles.icon}>A</span>
              <input
                type="range"
                min={10}
                max={120}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className={styles.sizeSlider}
              />
              <span className={styles.label}>{size}px</span>
            </div>

            <div className={styles.divider} />

            {/* Colour */}
            <div className={styles.toolItem}>
              <span className={styles.icon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0a.5.5 0 0 1 .47.33L11.09 7H4.91L7.53.33A.5.5 0 0 1 8 0zM4.5 8h7a.5.5 0 0 1 .47.67L9.41 15H6.59L4.03 8.67A.5.5 0 0 1 4.5 8z" />
                </svg>
              </span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles.colorPicker}
              />
            </div>

            <div className={styles.divider} />

            {/* Font dropdown */}
            <div className={styles.toolItem}>
              <span className={styles.icon} style={{ fontSize: "22px" }}>
                f
              </span>
              <select
                value={font.id}
                onChange={(e) => {
                  const sel = FONTS.find((f) => f.id === e.target.value);
                  if (sel) setFont(sel);
                }}
                className={styles.fontSelect}
              >
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.divider} />

            {/* Counter */}
            <div className={styles.toolItem}>
              <span className={styles.label}>{charCount}/40</span>
            </div>

            <div className={styles.divider} />

            {/* Hint */}
            <div className={styles.toolItem}>
              <span className={styles.icon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm10 10H3V4h10v8z" />
                  <path d="M5 5h2v2H5V5zm4 0h2v2H9V5zM5 9h2v2H5V9zm4 9h2v2H9V9z" />
                </svg>
              </span>
              <span className={styles.label}>Double‑tap to edit</span>
            </div>
          </div>

          <button
            className={styles.closeButton}
            onClick={() => setToolbarOpen(false)}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}