const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos
// Servimos la raíz para que index.html sea accesible, y también la carpeta public
app.use(express.static(__dirname));

// Rutas de la API
const leerDatos = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    const contenido = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(contenido);
};

const guardarDatos = (datos) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2));
};

app.get('/api/elementos', (req, res) => {
    const elementos = leerDatos();
    res.json(elementos);
});

app.post('/api/elementos', (req, res) => {
    const elementos = leerDatos();
    const nuevoElemento = req.body;
    
    // Generar ID si no viene (aunque el front lo genera, mejor asegurar aquí)
    if (!nuevoElemento.id) {
        const ultimoId = elementos.reduce((max, el) => Math.max(max, el.id || 0), 0);
        nuevoElemento.id = ultimoId + 1;
    }
    
    elementos.push(nuevoElemento);
    guardarDatos(elementos);
    res.status(201).json(nuevoElemento);
});

app.delete('/api/elementos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let elementos = leerDatos();
    const inicialLength = elementos.length;
    elementos = elementos.filter(el => el.id !== id);
    
    if (elementos.length === inicialLength) {
        return res.status(404).json({ mensaje: 'Elemento no encontrado' });
    }
    
    guardarDatos(elementos);
    res.json({ mensaje: 'Elemento eliminado' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
