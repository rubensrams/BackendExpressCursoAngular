//Requeries
var express = require('express');
//Importar libreria para la subida de archivos
const fileUpload = require('express-fileupload');
//Inicializar variables
var app = express();

//Fyle system
var fs = require('fs');


var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options
app.use(fileUpload());

//Rutas
app.put('/:tipo/:id', (req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //asignado tipos validoss de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: {
                message: "Tipo de coleccion no es valida"
            }
        });

    }

    if (!req.files) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar un archivo',
            errors: { message: "Debe seleccionar una imagen" }
        });
    }

    //Validar que solo sea una imagen

    var archivo = req.files.imagen;
    var nombreCorto = archivo.name.split('.');
    var extension = nombreCorto[nombreCorto.length - 1];

    //Extensiones validas
    var imagenes = ['png', 'jpg', 'gif', 'jpeg'];

    if (imagenes.indexOf(extension) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: "Las extensiones validas son: " + imagenes.join(', ') }
        });

    }

    //Nombre de archivo personalizado
    //id del usuario mas el ramdom
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extension}`;

    //Mover el archivo a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            resp.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
            return;
        }

        subirPorTipo(tipo, id, nombreArchivo, resp);

    });



});

//Funcion que sube alguna coleccion 
function subirPorTipo(tipo, id, nombreArchivo, resp) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {


            if (err) {
                resp.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar el archivo',
                    errors: err
                });
                return;
            }
            if (!usuario) {
                resp.status(200).json({
                    ok: false,
                    mensaje: 'El id del usuario ' + id + ' no existe',
                    errors: err
                });
                return;
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            //Si existe eliminala imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (err) {
                resp.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar el archivo',
                    errors: err
                });
                return;
            }

            if (!medico) {
                resp.status(200).json({
                    ok: false,
                    mensaje: 'El id del medico ' + id + ' no existe',
                    errors: err
                });
                return;
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            //Si existe eliminala imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medicoActualizado: medicoActualizado
                });
            });

        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                resp.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar el archivo',
                    errors: err
                });
                return;
            }

            if (!hospital) {
                resp.status(200).json({
                    ok: false,
                    mensaje: 'El id del hospital ' + id + ' no existe',
                    errors: err
                });
                return;
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            //Si existe eliminala imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });
            });

        });
    }


}

module.exports = app;