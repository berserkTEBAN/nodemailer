const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    edad: {
        type: Number,
        required: true
    },
    escolaridad: {
        type: String,
        required: true
    },
    grupo: {
        type: String,
        required: true
    },
    vive_con: {
        type: String,
        required: true
    },
    fuente_referencia: {
        type: String,
        required: true
    },
    entrevistador: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
