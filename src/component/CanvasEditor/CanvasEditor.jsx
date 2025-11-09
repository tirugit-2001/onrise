import React, { useEffect, useRef, useState } from 'react';
import { Type, Palette, Maximize2, Edit3 } from 'lucide-react';

const CanvasEditor = ({ product, onDesignChange }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedObject, setSelectedObject] = useState(null);
  const [textValue, setTextValue] = useState(product?.presetText || '');
  const [fontSize, setFontSize] = useState(product?.fontSize || 28);
  const [fontColor, setFontColor] = useState(product?.fontColor || '#ffffff');
  const [activeTab, setActiveTab] = useState('font');

  // Font sizes array
  const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];

  useEffect(() => {
    // Load Fabric.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    script.async = true;
    script.onload = () => initializeCanvas();
    document.body.appendChild(script);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeCanvas = () => {
    if (!window.fabric || !canvasRef.current) return;

    const canvas = new window.fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#f0f0f0',
    });

    fabricCanvasRef.current = canvas;

    // Load canvas background (shirt image)
    if (product?.canvasImage) {
      window.fabric.Image.fromURL(product.canvasImage, (img) => {
        img.scaleToWidth(canvas.width);
        img.scaleToHeight(canvas.height);
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        
        // Add illustration image
        if (product?.illustrationImage) {
          addIllustration();
        }
      }, { crossOrigin: 'anonymous' });
    }

    // Handle object selection
    canvas.on('selection:created', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        setTextValue(obj.text || '');
        setFontSize(obj.fontSize || 28);
        setFontColor(obj.fill || '#ffffff');
      }
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        setTextValue(obj.text || '');
        setFontSize(obj.fontSize || 28);
        setFontColor(obj.fill || '#ffffff');
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    canvas.on('object:modified', () => {
      exportDesign();
    });

    // Handle text editing and changes
    canvas.on('text:changed', (e) => {
      if (e.target) {
        setTextValue(e.target.text);
        
        // Check if text width exceeds canvas width and auto-wrap or limit
        const textWidth = e.target.width * e.target.scaleX;
        const canvasWidth = canvas.width;
        
        if (textWidth > canvasWidth - 20) {
          // Auto-adjust text position to center if it's too wide
          e.target.set({ left: canvasWidth / 2 });
        }
        
        exportDesign();
      }
    });

    canvas.on('text:editing:entered', (e) => {
      console.log('Text editing started');
    });

    canvas.on('text:editing:exited', (e) => {
      console.log('Text editing ended');
      exportDesign();
    });

    // Restrict objects from moving outside canvas
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // For text objects, prevent them from going outside canvas width
      if (obj.type === 'i-text' || obj.type === 'text') {
        const textWidth = obj.width * obj.scaleX;
        const textHeight = obj.height * obj.scaleY;
        
        // Restrict horizontal movement - keep text within canvas bounds
        const minLeft = textWidth / 2;
        const maxLeft = canvasWidth - textWidth / 2;
        
        if (obj.left < minLeft) {
          obj.left = minLeft;
        }
        if (obj.left > maxLeft) {
          obj.left = maxLeft;
        }
        
        // Restrict vertical movement
        if (obj.top < textHeight / 2) {
          obj.top = textHeight / 2;
        }
        if (obj.top > canvasHeight - textHeight / 2) {
          obj.top = canvasHeight - textHeight / 2;
        }
      } else {
        // For images and other objects
        const objWidth = obj.width * obj.scaleX;
        const objHeight = obj.height * obj.scaleY;
        
        if (obj.left < objWidth / 2) {
          obj.left = objWidth / 2;
        }
        if (obj.left > canvasWidth - objWidth / 2) {
          obj.left = canvasWidth - objWidth / 2;
        }
        if (obj.top < objHeight / 2) {
          obj.top = objHeight / 2;
        }
        if (obj.top > canvasHeight - objHeight / 2) {
          obj.top = canvasHeight - objHeight / 2;
        }
      }
    });

    // Also restrict when scaling text to prevent it from exceeding canvas width
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (obj.type === 'i-text' || obj.type === 'text') {
        const textWidth = obj.width * obj.scaleX;
        const canvasWidth = canvas.width;
        
        // If text width exceeds canvas width, limit the scale
        if (textWidth > canvasWidth - 20) {
          const maxScale = (canvasWidth - 20) / obj.width;
          obj.scaleX = maxScale;
          obj.scaleY = maxScale;
        }
      }
    });

    // Handle text modified event
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        // After modification, check text bounds
        const textWidth = obj.width * obj.scaleX;
        const canvasWidth = canvas.width;
        
        if (textWidth > canvasWidth - 20) {
          const maxScale = (canvasWidth - 20) / obj.width;
          obj.scaleX = maxScale;
          obj.scaleY = maxScale;
          canvas.renderAll();
        }
      }
      exportDesign();
    });

    setIsLoading(false);
  };

  const addIllustration = () => {
    if (!fabricCanvasRef.current || !product?.illustrationImage) return;

    const canvas = fabricCanvasRef.current;

    window.fabric.Image.fromURL(product.illustrationImage, (img) => {
      // Calculate scale to fit within canvas while maintaining aspect ratio
      const maxWidth = canvas.width * 0.5;
      const maxHeight = canvas.height * 0.4;
      
      let scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      
      // Adjust scale based on illustrationSize setting
      if (product.illustrationSize === 'small') scale *= 0.7;
      if (product.illustrationSize === 'medium') scale *= 1;
      if (product.illustrationSize === 'large') scale *= 1.3;

      img.scale(scale);
      
      const illustrationHeight = img.height * scale;
      
      img.set({
        left: canvas.width / 2.2,
        top: canvas.height / 2 - 10,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });

      canvas.add(img);
      
      // Add text below illustration with proper spacing
      addTexts(illustrationHeight);
      
      canvas.renderAll();
      exportDesign();
    }, { crossOrigin: 'anonymous' });
  };

  const addTexts = (illustrationHeight = 0) => {
    if (!fabricCanvasRef.current || !product?.presetText) return;

    const canvas = fabricCanvasRef.current;
    
    // Position text below the illustration with spacing
    const textTopPosition = (canvas.height / 2 - 20) + (illustrationHeight / 2) + 30;
    
    const text = new window.fabric.IText(product.presetText, {
      left: canvas.width / 2.2,
      top: textTopPosition,
      originX: 'center',
      originY: 'center',
      fontSize: fontSize,
      fill: fontColor,
      fontFamily: product.fontFamily || 'Arial',
      editable: true,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    canvas.add(text);
    canvas.renderAll();
    exportDesign();
  };

  const updateFontSize = (newSize) => {
    setFontSize(newSize);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      selectedObject.set({ fontSize: newSize });
      fabricCanvasRef.current.renderAll();
      exportDesign();
    }
  };

  const updateColor = (newColor) => {
    setFontColor(newColor);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      selectedObject.set({ fill: newColor });
      fabricCanvasRef.current.renderAll();
      exportDesign();
    }
  };

  const updateFontFamily = (fontFamily) => {
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      selectedObject.set({ fontFamily });
      fabricCanvasRef.current.renderAll();
      exportDesign();
    }
  };

  const enterEditMode = () => {
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      selectedObject.enterEditing();
      selectedObject.selectAll();
      fabricCanvasRef.current.renderAll();
    }
  };

  const exportDesign = () => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });
    
    if (onDesignChange) {
      onDesignChange(dataURL);
    }
  };

  return (
    <div className="canvas-editor-container" style={{ position: 'relative' }}>
      <div style={{ 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        position: 'relative'
      }}>
        <canvas ref={canvasRef} />
        
        {/* Inline editing hint */}
        {!isLoading && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            pointerEvents: 'none'
          }}>
            Double-click text to edit directly
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading editor...
        </div>
      )}

      {/* Editor Controls */}
      <div style={{
        marginTop: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '10px'
        }}>
          {[
            { id: 'font', label: 'Font', icon: Type },
            { id: 'color', label: 'Color', icon: Palette },
            { id: 'size', label: 'Size', icon: Maximize2 },
            { id: 'edit', label: 'Edit', icon: Edit3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: activeTab === id ? '#000' : 'transparent',
                color: activeTab === id ? '#fff' : '#666',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '120px' }}>
          {activeTab === 'font' && (
            <div>
              <h4 style={{ marginBottom: '12px', color: '#333' }}>Font Family</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Impact', 'Comic Sans MS'].map((font) => (
                  <button
                    key={font}
                    onClick={() => updateFontFamily(font)}
                    disabled={!selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text')}
                    style={{
                      padding: '10px 16px',
                      border: '1px solid #ddd',
                      backgroundColor: selectedObject && selectedObject.fontFamily === font ? '#000' : '#fff',
                      color: selectedObject && selectedObject.fontFamily === font ? '#fff' : '#333',
                      borderRadius: '6px',
                      cursor: selectedObject ? 'pointer' : 'not-allowed',
                      fontFamily: font,
                      fontSize: '14px',
                      opacity: selectedObject ? 1 : 0.5
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'color' && (
            <div>
              <h4 style={{ marginBottom: '12px', color: '#333' }}>Text Color</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateColor(color)}
                    disabled={!selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text')}
                    style={{
                      width: '50px',
                      height: '50px',
                      border: fontColor === color ? '3px solid #000' : '1px solid #ddd',
                      backgroundColor: color,
                      borderRadius: '8px',
                      cursor: selectedObject ? 'pointer' : 'not-allowed',
                      opacity: selectedObject ? 1 : 0.5
                    }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => updateColor(e.target.value)}
                disabled={!selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text')}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  height: '40px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: selectedObject ? 'pointer' : 'not-allowed',
                  opacity: selectedObject ? 1 : 0.5
                }}
              />
            </div>
          )}

          {activeTab === 'size' && (
            <div>
              <h4 style={{ marginBottom: '12px', color: '#333' }}>Font Size</h4>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
              }}>
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => updateFontSize(size)}
                    disabled={!selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text')}
                    style={{
                      padding: '12px 8px',
                      border: fontSize === size ? '2px solid #2196F3' : '1px solid #ddd',
                      backgroundColor: fontSize === size ? '#2196F3' : '#fff',
                      color: fontSize === size ? '#fff' : '#333',
                      borderRadius: '6px',
                      cursor: selectedObject ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: fontSize === size ? '600' : '400',
                      opacity: selectedObject ? 1 : 0.5,
                      transition: 'all 0.2s'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div>
              <h4 style={{ marginBottom: '12px', color: '#333' }}>Edit Text</h4>
              {!selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text') ? (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Edit3 size={48} style={{ color: '#666', marginBottom: '12px' }} />
                  <p style={{ color: '#666', fontSize: '16px', marginBottom: '8px' }}>
                    Click on any text in the canvas above to select it
                  </p>
                  <p style={{ color: '#999', fontSize: '14px' }}>
                    Then double-click to edit directly on the canvas
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    border: '1px solid #4CAF50',
                    marginBottom: '12px'
                  }}>
                    <p style={{ color: '#2e7d32', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>
                      ✓ Text is selected!
                    </p>
                    <p style={{ color: '#558b2f', fontSize: '13px', margin: 0 }}>
                      Current text: "{textValue}"
                    </p>
                  </div>
                  <button
                    onClick={enterEditMode}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Edit3 size={18} />
                    Start Editing Text
                  </button>
                  <p style={{
                    marginTop: '12px',
                    color: '#666',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}>
                    Or double-click the text on canvas to edit
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {!selectedObject && (
          <p style={{ 
            marginTop: '16px', 
            color: '#999', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Click on any text or image to edit • Double-click text to type directly
          </p>
        )}
      </div>
    </div>
  );
};

export default CanvasEditor;