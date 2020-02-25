//Requeries
var express = require('express');
var mdAuthenticacion = require('../midleware/authenticacion');
//Inicializar variables
var app = express();

//Importar esquema
var Medico = require('../models/medico');

//Rutas
app.get('/', (req, resp, next) => {


    //espera un valor, si no viene nada se coloca 0
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        //Salta el numero desde pasado del request y presenta los siguientes 5
        .skip(desde)
        //limita la respuesta a 5 registros
        .limit(5)
        //el populate regresa todo el objeto del la tabla en referencia osea usuarios
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    resp.status(500).json({
                        ok: false,
                        mensaje: 'Error en la consulta de usuarios',
                        errors: err
                    });
                    return;
                }
                Medico.count({}, (err, count) => {
                    resp.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: count
                    });
                });

            });


});


//===================================================
//Actualizacion de un medico
//===================================================

app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el  hospital',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe el medico con ese Id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                medico: medicoGuardado,
            });
        });

    });

});

//===================================================
//Creacion de un nuevo medico
//===================================================

app.post('/', mdAuthenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital

    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado,
        });


    });

});


//===================================================
//Borrar un usuario popr id
//===================================================

app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe el medico con ese Id' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
        });
    });

});

module.exports = app;