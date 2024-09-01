const express = require('express');
const wol = require('wake_on_lan');// :)
const app = express();
const cors = require('cors');
const { exec } = require('child_process'); 
const port = 3001;

app.use(cors());
app.use(express.json()); 

// Ejemplo: http://localhost:3001/wake/40:B0:34:1C:EE:E5   
// El mac se emvia con ":" dos puntos 40:B0:34:1C:EE:E5
// Si la computadora es compatible, esta ctivo el wake-on-lan y en la misma red la pc encenderá.
app.get('/wake/:mac', (req, res) => {
    const macAddress = req.params.mac;
    if (!macAddress) {
        return res.status(400).send('Se requiere la direccion MAC');
    }

    wol.wake(macAddress, (error) => {
        if (error) {
            return res.status(500).send('Error al enviar el paquete Wake-on-LAN');
        }
        res.send('Paquete Wake-on-LAN enviado con éxito');
    });
});

app.post('/print', (req, res) => {
    const { ip, password } = req.body;
    if (!ip || !password) {
        return res.status(400).send('Se requiere la dirección IP y la contraseña');
    }

    const command = `"C:\\Program Files\\uvnc bvba\\UltraVNC\\vncviewer.exe" ${ip} /password ${password} /viewonly -serverscale 2`;

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
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor => Wake-on-LAN y abrir Uvnc escuchando en el puerto: ${port}`);
});
