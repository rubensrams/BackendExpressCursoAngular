var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre	es	necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

//Otro	tema	que	no	vimos,	es la	parte	de	{	collection:	‘hospitales’ } 
//esto	simplemente	es	para	
//evitar	que	Mongoose	coloque	el	nombre	a	la	colección como	hospitals.
module.exports = mongoose.model('Hospital', hospitalSchema);