//Requeries
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//Inicializar variables
var app = express();

//Importar esquema
var Usuario = require('../models/usuario');


//Rutas
app.post('/', (req, resp) => {

    var body = req.body;

    //Que el email se encontrado con el email del post
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'

            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
            });
        }

        //Crear un token
        //expira 4 horas
        //Quitando el password
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 })

        resp.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });

    });

});





module.exports = app;