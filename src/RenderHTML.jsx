import React, { useEffect, useRef } from 'react';
import './RenderHTML.css';  // Si tienes estilos específicos

const RenderHTML = ({ htmlContent }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && htmlContent) {
      // Limpiar el contenido anterior
      containerRef.current.innerHTML = '';
      
      // Crear un elemento div temporal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Encontrar y ejecutar scripts externos necesarios para Plotly
      const scripts = tempDiv.getElementsByTagName('script');
      const scriptPromises = Array.from(scripts).map(script => {
        if (script.src) {
          return new Promise((resolve, reject) => {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.onload = resolve;
            newScript.onerror = reject;
            document.head.appendChild(newScript);
          });
        }
        return Promise.resolve();
      });

      // Una vez que los scripts externos estén cargados, insertar el contenido
      Promise.all(scriptPromises).then(() => {
        containerRef.current.innerHTML = htmlContent;
        
        // Ejecutar scripts en línea
        const inlineScripts = containerRef.current.getElementsByTagName('script');
        Array.from(inlineScripts).forEach(script => {
          if (!script.src) {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
          }
        });
      });
    }
  }, [htmlContent]);

  return (
    <div 
      ref={containerRef} 
      className="visualization-container"
    />
  );
};

export default RenderHTML;