import React, { useState, useEffect } from 'react';

function Prueba1() {
  // Estado para almacenar la lista de archivos del repositorio
  const [files, setFiles] = useState([]);
  // Estado para almacenar el contenido del algoritmo (archivo) seleccionado
  const [algorithm, setAlgorithm] = useState('');
  // Estado para almacenar el resultado de la ejecución del algoritmo
  const [output, setOutput] = useState('');
  // Estado para almacenar el nombre del archivo seleccionado
  const [selectedFile, setSelectedFile] = useState('');
  // Estados para los valores de los textbox
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const repoUrl = 'https://github.com/louisx172/Prueba_suma'; //REMPLAZAR

  // Función para obtener la lista de archivos en el repositorio de GitHub
  const handleFetchFiles = async () => {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const fileList = data.filter((item) => item.type === 'file');
      setFiles(fileList);
    } catch (error) {
      setOutput('Error al obtener la lista de archivos del repositorio.');
    }
  };

  // Efecto para obtener los archivos automáticamente al cargar el componente
  useEffect(() => {
    handleFetchFiles();
  }, []);

  // Función para obtener el contenido de un archivo específico del repositorio
  const handleFetchAlgorithm = async (filePath) => {
    setSelectedFile(filePath);
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.content) {
        const decodedContent = atob(data.content);
        setAlgorithm(decodedContent);
      } else {
        setOutput('No se pudo encontrar el archivo en el repositorio.');
      }
    } catch (error) {
      setOutput('Error al obtener el archivo del repositorio.');
    }
  };

  // Función para ejecutar el código contenido en el algoritmo
  const handleRunAlgorithm = async () => {
    try {
      let fileExtension = selectedFile.split('.').pop();
      if (fileExtension === 'c++') {
        fileExtension = 'cpp';
      }

      console.log('Extensión del archivo:', fileExtension);
      console.log('Input1:', input1);  // Muestra el valor del primer textbox
      console.log('Input2:', input2);  // Muestra el valor del segundo textbox

      // Usa JSON.stringify para manejar correctamente el escape de caracteres
      const response = await fetch('http://localhost:3001/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: algorithm,
          language: fileExtension,
          input1, // Enviar el valor de input1
          input2, // Enviar el valor de input2
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setOutput(result.output);
    } catch (error) {
      console.error('Error al ejecutar el algoritmo:', error);
      setOutput(`Error al ejecutar el algoritmo: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Prueba1</h2>
      <p>Esta es la página de Prueba.</p>

      <div>
        {files.map((file) => (
          <button key={file.path} onClick={() => handleFetchAlgorithm(file.path)}>
            Cargar {file.name}
          </button>
        ))}
      </div>

      {algorithm && (
        <div>
          <h3>Algoritmo cargado ({selectedFile}):</h3>
          <pre>{algorithm}</pre>

          {/* Campos de texto que aparecen cuando se carga el algoritmo */}
          <input
            type="text"
            placeholder="Valor para input1"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
          <input
            type="text"
            placeholder="Valor para input2"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
          />
          <button onClick={handleRunAlgorithm}>Ejecutar Algoritmo</button>
        </div>
      )}

      {output && (
        <div>
          <h3>Resultado:</h3>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}

export default Prueba1;
