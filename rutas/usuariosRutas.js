//Requeries
var express = require('express');
var bcrypt = require('bcryptjs');


var mdAuthenticacion = require('../midleware/authenticacion');
//Inicializar variables
var app = express();

//Importar esquema
var Usuario = require('../models/usuario');

//Rutas
app.get('/', (req, resp, next) => {

    //espera un valor, si no viene nada se coloca 0
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        //Salta el numero desde pasado del request y presenta los siguientes 5
        .skip(desde)
        //limita la respuesta a 5 registros
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    resp.status(500).json({
                        ok: false,
                        mensaje: 'Error en la consulta de usuarios',
                        errors: err
                    });
                    return;
                }

                Usuario.count({}, (err, count) => {
                    resp.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: count
                    })

                });


            });


});


//===================================================
//Actualizacion de un usuario
//===================================================

app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el  usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe el usuario con ese Id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuario.password = ':)';
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
            });
        });

    });

});

//===================================================
//Creacion de un nuevo usuario
//===================================================

app.post('/', mdAuthenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });


    });

});


//===================================================
//Borrar un usuario popr id
//===================================================

app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe el usuario con ese Id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
        });
    });

});

module.exports = app;