//Requeries
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

//Inicializar variables
var app = express();

//Importar esquema
var Usuario = require('../models/usuario');

//Importaciones para google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//================================================
//Autenticacion GOOGLE
//================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        payload: payload,
        google: true,
    }
}

//Rutas
app.post('/google', async(req, resp) => {

    var token = req.body.token;


    //Para usar el await es necesario que la funcion sea async
    var googleUser = await verify(token)
        .catch(e => {
            return resp.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });

        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }
        //vergificacion y registro por token

        if (usuarioBD) {

            if (usuarioBD.google === false) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'

                });
            } else {

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 })

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            }
        } else {

            //El usuario no existe hay que crearlo

            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });

            usuario.save((err, usuarioGuardado) => {

                if (err) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear el usuario',
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 })

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token: token,
                    id: usuarioGuardado._id
                });


            });
        }

    });


});


//================================================
//Autenticacion normal
//================================================

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