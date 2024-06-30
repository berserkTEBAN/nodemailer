const routes = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const $ = require('jquery');
const moment = require('moment');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const nodemailer = require('nodemailer'); // Importa el módulo nodemailer
const request = require('request'); // Importa el módulo request para descargar la imagen
const fs = require('fs'); // Importa el módulo fs para manipular archivos
const app = require('express')();
const Usuario = require('../models/usuario');

// Agregar middleware para express-session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Configurar servicio de correo saliente (SMTP)
//En esta parte pon tu correo , contraseña de tu corrreo
//Si te da error ve a tu cuenta de google - seguridad y activa : Acceso de apps menos seguras
//Te debe salir : Permitir el acceso de apps menos seguras: SÍ , esto por si tienes autenticacion de 2 factores
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ejemplodecorreo@gmail.com',
    pass: 'ejemplodepassword'
  }
});

routes.get('/login', (req, res) => {
  res.render('login');
});

routes.get('/reloj', (req, res) => {
  res.render('hora');
});

// Definir la ruta para cerrar sesión
routes.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

// Montar las rutas en la aplicación
app.use('/', routes);

//-------------------------------COLECCION---------------------------------------------------------------------//
//constante para poder usar los schemas de modelos de la coleccion usuario,facilito 
const User  = require('../models/usuario');

routes.get('/salir', (req, res) => {
    req.session.destroy(); //el metodo destroy cierra la sesion iniciada en el login
    res.redirect('/login'); 
});

routes.get('/login', (req, res) => {
  res.render('login');
});
routes.post('/register', async (req, res) => {
  try {
    const { nombre, edad, escolaridad, grupo, vive_con, fuente_referencia, entrevistador, correo, dia_cita, hora_cita, active } = req.body;
    
    // Verificar si ya existe una cita para la misma fecha y hora
    const citaExistente = await Usuario.findOne({ dia_cita, hora_cita });

    if (citaExistente) {
      // Si ya existe una cita para esa fecha y hora, enviar un mensaje de error al usuario
      return res.status(400).send('La fecha y hora seleccionadas ya están ocupadas. Por favor, elige otro horario.');
    }

    // Crear un nuevo usuario con los datos proporcionados
    const nuevoUsuario = new Usuario({
      nombre,
      edad,
      escolaridad,
      grupo,
      vive_con,
      fuente_referencia,
      entrevistador,
      correo,
      dia_cita,
      hora_cita,
      active
    });

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    // Resto del código para enviar correo, descargar imagen, etc.

    res.redirect('/home');
    console.log("nuevousuaruio")
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el registro de usuario');
  }
});

// Endpoint GET para obtener fechas y horas ocupadas
routes.get('/citas_ocupadas', async (req, res) => {
  try {
    // Consultar todas las citas existentes en la base de datos
    const citasOcupadas = await Usuario.find({}, 'dia_cita hora_cita');

    // Si no hay citas ocupadas, devolver un mensaje indicando que no hay citas registradas
    if (citasOcupadas.length === 0) {
      console.log('No hay citas registradas en la base de datos.');
      return res.status(404).send('No hay citas registradas en la base de datos.');
    }

    // Si hay citas ocupadas, devolver un array con las fechas y horas ocupadas
    const citas = citasOcupadas.map(cita => ({
      dia_cita: cita.dia_cita,
      hora_cita: cita.hora_cita
    }));

    // Imprimir en la consola las citas ocupadas
    console.log('Citas ocupadas:');
    citas.forEach(cita => {
      console.log(`Fecha: ${cita.dia_cita}, Hora: ${cita.hora_cita}`);
    });

    // Enviar las citas ocupadas como respuesta
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las citas ocupadas.');
  }
});
//Obtener citas 
routes.get('/getuser', async (req, res) => {
  try {
    // Aquí obtienes todos los usuarios registrados, por ejemplo
    const usuarios = await Usuario.find().exec();
    res.json(usuarios); // Devolver los usuarios como JSON
    console.log(usuarios); // Mostrar los usuarios en la consola del servidor
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los usuarios');
  }
});
// Ruta para eliminar un usuario por su ID
routes.delete('/eliminar_usuario/:id', async (req, res) => {
  const usuarioId = req.params.id;

  try {
      // Buscar y eliminar el usuario por su ID
      const usuarioEliminado = await Usuario.findByIdAndDelete(usuarioId);

      if (!usuarioEliminado) {
          return res.status(404).send('Usuario no encontrado');
      }

      res.status(200).send('Usuario eliminado correctamente');
  } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).send('Error al eliminar usuario');
  }
});

//--------------------------------------------------------RUTAS BASICAS DE LA PAGINA -----------------------------------------------------------
//Los get siempre sirven para dirigir no mandar por si decirlo o muestra
routes.get('/home', (req, res) => {
  res.render('home');
});

routes.get('/panel1', (req, res) => {
  res.render('panel1');
});

routes.get('/panel2', (req, res) => {
  res.render('panel2');
});

routes.get('/panel3', (req, res) => {
  res.render('panel3');
});

//------------------------EXTRAS------------------------------

routes.get('/panel', (req, res)=>{
  res.render('panel');
  //res.send('esta es la raiz pai')
});

routes.get('/instructivo', (req, res)=>{
  res.render('instructivo');
  //res.send('esta es la raiz pai')
});

routes.get('/boni', (req, res)=>{
  res.render('users');
  //res.send('esta es la raiz pai')
});

///////////////////foticos/////////////
routes.get('/esquema', (req, res) => {
  res.render('esquema');
});

module.exports = routes;
