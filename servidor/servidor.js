const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const TEMP_DIR = path.join(__dirname, 'temp_scripts');
const VIZ_DIR = path.join(__dirname, 'public', 'visualizations');

// Asegura que las carpetas necesarias existan
async function ensureDirectories() {
    for (const dir of [TEMP_DIR, VIZ_DIR]) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
}

// Elimina archivos temporales si existen
async function cleanupTempFiles(filePath) {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Error al eliminar archivo temporal:', error);
        }
    }
}

// Ruta para ejecutar código Python
app.post('/execute', async (req, res) => {
    let hasResponded = false;
    let timeoutId = null;
    let pythonProcess = null;

    const cleanup = async (filePath) => {
        if (timeoutId) clearTimeout(timeoutId);
        if (pythonProcess) pythonProcess.kill();
        await cleanupTempFiles(filePath);
    };

    const sendResponse = (statusCode, data) => {
        if (!hasResponded) {
            hasResponded = true;
            res.status(statusCode).json(data);
        }
    };

    const { code, inputs } = req.body; // Recibe el código y los inputs

    if (!code) {
        return sendResponse(400, { error: 'No se proporcionó código para ejecutar' });
    }

    await ensureDirectories();

    const timestamp = Date.now();
    const tempFilePath = path.join(TEMP_DIR, `script_${timestamp}.py`);

    try {
        await fs.writeFile(tempFilePath, code); // Guarda el código en un archivo temporal

        // Ejecuta el código en Python con los inputs
        pythonProcess = spawn('python', [tempFilePath, ...inputs]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', async (exitCode) => {
            await cleanup(tempFilePath);

            if (exitCode !== 0) {
                sendResponse(500, {
                    error: 'Error en la ejecución del código Python',
                    details: errorOutput
                });
            } else {
                sendResponse(200, { output: output.trim() });
            }
        });

    } catch (error) {
        await cleanup(tempFilePath);
        sendResponse(500, { error: 'Error al procesar la solicitud', details: error.message });
    }
});

// Ruta para generar visualizaciones con Plotly
app.post('/generate-visualization', async (req, res) => {
    const { jsonData } = req.body; // Recibe los datos JSON para la visualización

    if (!jsonData) {
        return res.status(400).json({ error: 'No se proporcionaron datos para la visualización' });
    }

    await ensureDirectories();

    const timestamp = Date.now();
    const jsonFilePath = path.join(TEMP_DIR, `data_${timestamp}.json`);
    const htmlFilePath = path.join(VIZ_DIR, `visualization_${timestamp}.html`);

    try {
        await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2)); // Guarda los datos en un archivo JSON

        // Ejecuta el script de Python para generar la visualización
        const pythonProcess = spawn('python', ['generate_plotly.py', jsonFilePath, htmlFilePath]);

        pythonProcess.on('close', async (exitCode) => {
            await cleanupTempFiles(jsonFilePath);

            if (exitCode !== 0) {
                return res.status(500).json({ error: 'Error en la generación de la visualización' });
            }

            res.json({ visualizationUrl: `/visualizations/visualization_${timestamp}.html` });
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud', details: error.message });
    }
});

// Ruta para verificar el estado del servidor
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Inicia el servidor en el puerto 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
