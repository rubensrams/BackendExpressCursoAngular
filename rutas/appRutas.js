//Requeries
var express = require('express');

//Inicializar variables
var app = express();

//Rutas
app.get('/', (req, resp, next) => {

    resp.status(200).json({
        ok: true,
        mensaje: 'Peticion correcta'
    });

});


module.exports = app;