//Requeries
var express = require('express');
var mongoose = require('mongoose');

//Para recibir un post request
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, resp) => {

    if (err) throw err;

    console.log('Base de datos : \x1b[32m%s\x1b[0m', 'online');

})

//Importar rutas
var appRutas = require('./rutas/appRutas');
var appRutaUsuario = require('./rutas/usuariosRutas');
var appRutaLogin = require('./rutas/loginRutas');

//Rutas
app.use('/usuario', appRutaUsuario);
app.use('/login', appRutaLogin);
app.use('/', appRutas);

//Escuchar peticiones
app.listen(3000, () => {

    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});