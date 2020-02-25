//Requeries
var express = require('express');

//Inicializar variables
var app = express();

//este path ya viene con node
//sirve para crear la path de la imagen
const path = require('path');
const fs = require('fs');

//Rutas
app.get('/:tipo/:img', (req, resp, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        resp.sendFile(pathImagen);
    } else {
        var pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');
        resp.sendFile(pathNoImg);
    }

});


module.exports = app;