const express = require('express');
const wol = require('wake_on_lan'); // :)
const app = express();
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs'); // Para verificar la existencia de archivos o directorios
const port = 3001;

app.use(cors());
app.use(express.json());

// Rutas de UltraVNC
const path64 = `"C:\\Program Files\\uvnc bvba\\UltraVNC\\vncviewer.exe"`;
const path32 = `"C:\\Program Files (x86)\\uvnc bvba\\UltraVNC\\vncviewer.exe"`;

// Función para seleccionar la ruta adecuada
function getVncPath() {
    if (fs.existsSync(path64.replace(/"/g, ''))) {
        return path64;
    } else if (fs.existsSync(path32.replace(/"/g, ''))) {
        return path32;
    } else {
        return null; // Si no se encuentra ninguna de las dos rutas
    }
}

// Ruta Wake-on-LAN
app.get('/wake/:mac', (req, res) => {
    const macAddress = req.params.mac;
    if (!macAddress) {
        return res.status(400).send('MAC address is required');
    }

    wol.wake(macAddress, (error) => {
        if (error) {
            return res.status(500).send('Failed to send Wake-on-LAN packet');
        }
        res.send('Wake-on-LAN packet sent successfully');
    });
});

// Ruta para ejecutar UltraVNC
app.post('/print', (req, res) => {
    const { ip, password } = req.body;
    if (!ip || !password) {
        return res.status(400).send('Se requiere la dirección IP y la contraseña');
    }

    const vncPath = getVncPath();

    if (!vncPath) {
        return res.status(500).send('No se encontró UltraVNC en ninguna de las rutas');
    }

    const command = `${vncPath} ${ip} /password ${password} /viewonly -serverscale 2`;

    // Envía la respuesta antes de ejecutar el comando
    res.send('Comando enviado correctamente');

    // Ejecuta el comando
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Stdout: ${stdout}`);
    }).unref();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor => Wake-on-LAN y abrir Uvnc escuchando en el puerto: ${port}`);
});

