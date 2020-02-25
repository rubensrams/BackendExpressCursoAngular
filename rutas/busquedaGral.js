//Rutas para busqueda general

//Requeries
var express = require('express');
//Importar esquema
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//Inicializar variables
var app = express();


//=====================================================
//busqueda coleccion
//=====================================================
//Rutas
app.get('/coleccion/:tabla/:busqueda', (req, resp, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    //Expresion regular para hacer un like en la busqueda
    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return resp.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son medicos, usuarios y hospitales'
            });

    }
    promesa.then(data => {
        resp.status(200).json({
            ok: true,
            //aqui se pone entre corchete par que la salida 
            //ponga dinamicamente el contenido de la tabla
            [tabla]: data
        });

    });


});



//=====================================================
//busqueda general
//=====================================================
//Rutas
app.get('/todo/:busqueda', (req, resp, next) => {

    var busqueda = req.params.busqueda;

    //Expresion regular para hacer un like en la busqueda
    var regex = new RegExp(busqueda, 'i');


    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuarios(busqueda, regex)]).then(result => {

        resp.status(200).json({
            ok: true,
            hospitales: result[0],
            medicos: result[1],
            usuarios: result[2]
        });
    })

});

//Se crea unas promesas para la busqueda en general
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar los hospitales ', err);
                } else {
                    resolve(hospitales);
                }

            });

    });

}


//Se crea unas promesas para la busqueda en general
function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar los medicos ', err);
                } else {
                    resolve(medicos);
                }

            });

    });

}


//Se crea unas promesas para la busqueda en general
function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role').or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar los usuarios ', err);
                } else {
                    resolve(usuarios);
                }
            });


    });

}

module.exports = app;