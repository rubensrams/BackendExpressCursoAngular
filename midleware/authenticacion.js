var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
//===================================================
//Verificar token
//===================================================

//Se crea una funcion para que sea usada por los demas rutas js
exports.verificaToken = function(req, resp, next) {
    //asi se recibe el token
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decode) => {

        if (err) {
            return resp.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        //Ebviando el usuario al request
        req.usuario = decode.usuario;
        //Pueees continuar con las petivciones de abajo
        //el next
        next();

    });

}