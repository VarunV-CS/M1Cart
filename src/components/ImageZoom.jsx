import { useState, useRef } from 'react';
import './ImageZoom.css';

const ImageZoom = ({ 
  src, 
  alt, 
  zoomLevel = 2,
  lensSize = 100,
  resultSize = 400
}) => {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const imageContainerRef = useRef(null);
  const resultRef = useRef(null);

  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current || !resultRef.current) return;

    const container = imageContainerRef.current;
    const result = resultRef.current;
    const containerRect = container.getBoundingClientRect();
    const image = container.querySelector('img');
    
    // Get image dimensions and position
    const imgWidth = image.offsetWidth;
    const imgHeight = image.offsetHeight;
    
    // Calculate cursor position relative to the container
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    // Calculate the position as percentage
    const xPercent = (x / imgWidth) * 100;
    const yPercent = (y / imgHeight) * 100;
    
    // Update cursor position for lens
    setCursorPosition({ x, y });
    
    // Update zoom position (the position in the zoomed image)
    setZoomPosition({ x: xPercent, y: yPercent });
    
    // Set the background position of the result image
    result.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    
    // Calculate lens position (centered on cursor, but bounded)
    const lensHalfSize = lensSize / 2;
    let lensX = x - lensHalfSize;
    let lensY = y - lensHalfSize;
    
    // Bound the lens within the image container
    lensX = Math.max(0, Math.min(lensX, imgWidth - lensSize));
    lensY = Math.max(0, Math.min(lensY, imgHeight - lensSize));
    
    // Update lens position via CSS custom properties
    container.style.setProperty('--lens-x', `${lensX}px`);
    container.style.setProperty('--lens-y', `${lensY}px`);
  };

  return (
    <div className="image-zoom-container">
      <div 
        className="image-zoom-main"
        ref={imageContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ 
          '--lens-size': `${lensSize}px`,
          '--zoom-level': zoomLevel
        }}
      >
        <img src={src} alt={alt} />
        
        {/* Lens overlay */}
        <div className="zoom-lens">
          <div className="zoom-lens-inner"></div>
        </div>
        
        {/* Zoomed result panel */}
        {showZoom && (
          <div 
            className="zoom-result"
            ref={resultRef}
            style={{
              backgroundImage: `url(${src})`,
              width: resultSize,
              height: resultSize
            }}
          ></div>
        )}
      </div>
      
      {/* Instruction hint */}
      {!showZoom && (
        <div className="zoom-hint">
          Hover over image to zoom
        </div>
      )}
    </div>
  );
};

export default ImageZoom;

