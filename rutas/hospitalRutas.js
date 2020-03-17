//Requeries
var express = require('express');
var mdAuthenticacion = require('../midleware/authenticacion');
//Inicializar variables
var app = express();

//Importar esquema
var Hospital = require('../models/hospital');

//Rutas
app.get('/', (req, resp, next) => {

    //espera un valor, si no viene nada se coloca 0
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        //Salta el numero desde pasado del request y presenta los siguientes 5
        .skip(desde)
        //limita la respuesta a 5 registros
        .limit(5)
        //el populate regresa todo el objeto del la tabla en referencia osea usuarios
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    resp.status(500).json({
                        ok: false,
                        mensaje: 'Error en la consulta de usuarios',
                        errors: err
                    });
                    return;
                }
                Hospital.count({}, (err, count) => {
                    resp.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    });
                });

            });


});


//===================================================
//Actualizacion de un hospital
//===================================================

app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el  hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe el usuario con ese Id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
            });
        });

    });

});

//===================================================
//Creacion de un nuevo usuario
//===================================================

app.post('/', mdAuthenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
        });


    });

});


//===================================================
//Borrar un usuario popr id
//===================================================

app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe el hospital con ese Id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
        });
    });

});

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe ',
                    errors: {
                        message: 'No existe un hospital con ese ID '
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

module.exports = app;