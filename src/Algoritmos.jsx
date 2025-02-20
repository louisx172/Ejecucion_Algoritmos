import React, { useState, useEffect } from 'react';
import RenderHTML from './RenderHTML';
import './Algoritmos.css';

function Algoritmos() {
  const [files, setFiles] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [algorithmContent, setAlgorithmContent] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [output, setOutput] = useState('');
  const [inputs, setInputs] = useState([]);
  const [algorithmData, setAlgorithmData] = useState({});
  const [visualization, setVisualization] = useState(null);
  const [isGeneratingVisualization, setIsGeneratingVisualization] = useState(false);

  const repoUrl = 'https://github.com/louisx172/Prueba_suma';
  const languages = ['Python', 'JavaScript', 'C++'];
  const fileExtensions = { 'Python': 'py', 'JavaScript': 'js', 'C++': 'c++' };

  useEffect(() => {
    fetchFiles();
    fetchAlgorithmData();
  }, []);

  const countInputs = (code) => {
    if (code.includes("sys.argv[1:]")) {
      return 1; // Indicar que se necesita una sola entrada que puede contener múltiples valores
    }
  
    const matches = code.match(/sys\.argv\[\d+\]/g) || [];
    return matches.length; // Si usa sys.argv[n], contarlos normalmente
  };

  const fetchFiles = async () => {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const fileList = data
        .filter(item => item.type === 'file' && item.name !== 'data.json')
        .map(file => file.name.split('.')[0])
        .filter((value, index, self) => self.indexOf(value) === index);
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchAlgorithmData = async () => {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.content) {
        const decodedContent = atob(data.content);
        setAlgorithmData(JSON.parse(decodedContent));
      }
    } catch (error) {
      console.error('Error fetching algorithm data:', error);
    }
  };

  const fetchAlgorithmContent = async (fileName) => {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
    const contents = {};
  
    for (const lang of languages) {
      const extension = fileExtensions[lang];
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}.${extension}`;
  
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.content) {
          const decodedContent = atob(data.content);
          contents[lang] = decodedContent;
        }
      } catch (error) {
        console.error(`Error fetching ${lang} content:`, error);
      }
    }
  
    setAlgorithmContent(contents);
    setSelectedAlgorithm(fileName);
  
    if (contents['Python']) {
      const inputCount = countInputs(contents['Python']);
      setInputs(Array(inputCount).fill(''));  // Genera un array vacío del tamaño necesario
    }
  };
  

  const handleRunAlgorithm = async () => {
    if (selectedLanguage !== 'Python') {
      setOutput('Solo se permite ejecutar código en Python');
      return;
    }
  
    setIsGeneratingVisualization(true);
    setOutput('Ejecutando algoritmo...');
  
    const code = algorithmContent[selectedLanguage];
  
    const formattedInputs = inputs.length === 1 ? inputs[0].split(" ") : inputs;
  
    try {
      const response = await fetch('http://localhost:3001/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          inputs: formattedInputs 
        }),
      });
  
      const result = await response.json();
  
      if (result.error) {
        setOutput(`Error: ${result.error}\nDetalles: ${result.details || 'No hay detalles adicionales'}`);
      } else {
        try {
          const jsonData = JSON.parse(result.output);
          console.log("Contenido del JSON:", jsonData);
  
          // Enviar jsonData al backend para generar visualización
          const vizResponse = await fetch('http://localhost:3001/generate-visualization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonData })
          });
  
          const vizResult = await vizResponse.json();
  
          if (vizResult.visualizationUrl) {
            setVisualization(vizResult.visualizationUrl);
          } else {
            setOutput("No se pudo generar la visualización.");
          }
  
        } catch (e) {
          setOutput(result.output);
        }
      }
    } catch (error) {
      setOutput(`Error al ejecutar el algoritmo: ${error.message}`);
    } finally {
      setIsGeneratingVisualization(false);
    }
  };
  
  
  

  return (
    <div className="algoritmos-container">
      <div className="layout-wrapper">
        <aside className="sidebar">
          <div className="logo">
            <img src="/api/placeholder/50/50" alt="Logo" className="logo-image" />
          </div>
          <h3>Algoritmos</h3>
          <ul className="algorithm-list">
            {files.map((file) => (
              <li
                key={file}
                className={selectedAlgorithm === file ? 'active' : ''}
                onClick={() => fetchAlgorithmContent(file)}
              >
                {file}
              </li>
            ))}
          </ul>
        </aside>
        
        <div className="main-wrapper">
          <nav className="top-nav">
            <ul className="nav-links">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#algoritmos" className="active">Algoritmos</a></li>
              <li><a href="#lorem">Lorem</a></li>
              <li><a href="#conocenos">Conocenos</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </nav>

















          
          <div className="content">
            <main className="main-content">
              <h1>{algorithmData[selectedAlgorithm]?.title || 'Selecciona un algoritmo'}</h1>
              <p>
                {algorithmData[selectedAlgorithm]?.description || 
                 'Por favor, selecciona un algoritmo de la lista en el panel izquierdo.'}
              </p>
              {selectedAlgorithm && (
  <>
    {inputs.length === 1 ? (
      <input
        type="text"
        placeholder="Ingrese los números separados por espacios"
        value={inputs[0]}
        onChange={(e) => {
          setInputs([e.target.value]);
        }}
      />
    ) : (
      inputs.map((value, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Valor para input${index + 1}`}
          value={inputs[index]}
          onChange={(e) => {
            const newInputs = [...inputs];
            newInputs[index] = e.target.value;
            setInputs(newInputs);
          }}
        />
      ))
    )}
    <button onClick={handleRunAlgorithm}>Ejecutar Algoritmo</button>
  </>
)}


              {output && (
                <div>
                  <h3>Resultado:</h3>
                  <pre>{output}</pre>
                </div>
              )}

{visualization && (
  <div className="visualization-container">
    <h3>Visualización:</h3>
    <iframe
      src={`http://localhost:3001${visualization}`}
      style={{
        width: '100%',
        height: '600px',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      title="Algorithm Visualization"
    />
  </div>
)}








                  


            </main>
            
            {selectedAlgorithm && (
              <aside className="code-panel">
                <div className="language-tabs">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      className={`tab ${selectedLanguage === lang ? 'active' : ''}`}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <pre className="code-block">
                  <code>
                    {algorithmContent[selectedLanguage] || 'No hay contenido disponible para este lenguaje.'}
                  </code>
                </pre>
              </aside>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>Acerca de Nosotros</h4>
            <p>Somos una plataforma educativa dedicada a enseñar algoritmos y estructuras de datos de manera simple y efectiva.</p>
          </div>
          <div className="footer-column">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li><a href="#tutoriales">Tutoriales</a></li>
              <li><a href="#ejercicios">Ejercicios</a></li>
              <li><a href="#recursos">Recursos</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Recursos</h4>
            <ul>
              <li><a href="#documentacion">Documentación</a></li>
              <li><a href="#videos">Videos</a></li>
              <li><a href="#libros">Libros Recomendados</a></li>
              <li><a href="#faq">Preguntas Frecuentes</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contáctanos</h4>
            <p>Email: info@ejemplo.com</p>
            <p>Teléfono: (123) 456-7890</p>
            <div className="social-links">
              <a href="#twitter">Twitter</a>
              <a href="#github">GitHub</a>
              <a href="#linkedin">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AlgoritmosWeb. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

export default Algoritmos;