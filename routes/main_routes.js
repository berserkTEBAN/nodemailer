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

// Ruta para el registro de usuarios
routes.post('/register', async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre, edad, escolaridad, grupo, vive_con, fuente_referencia, entrevistador, correo, active } = req.body;
    
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
      active
    });

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    // Ruta y nombre de archivo de destino en el servidor
    const destination = 'C:/Users/teban/DispBetter/estatico/img/osva.jpg';

    // Descargar la imagen desde la URL
    request('https://imgs.search.brave.com/IXwu4rLhRkjcu9rC3jop0DPZvVcwtmkpzY9pa8NqjgY/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzFiL2Q4/LzM4LzFiZDgzOGM3/NjY5ZGJiNjUyZDAz/ZWMyMWQwZGM5NTcz/LmpwZw').pipe(fs.createWriteStream(destination)).on('close', function() {
      // Configuración del correo electrónico
      const mailOptions = {
        from: 'felipece.ti21@utsjr.edu.mx',//Aqui pon tu correo que sera el emisor del correo 
        to: correo,
        subject: 'Registro exitoso',
        text: `Tus datos han sido guardados exitosamente en nuestra base de datos. \n\n` +
              `<b>Nombre:</b> ${nombre} \n` +
              `<b>Edad:</b> ${edad} \n` +
              `<b>Escolaridad:</b> ${escolaridad} \n` +
              `<b>Grupo:</b> ${grupo} \n` +
              `<b>Vive con:</b> ${vive_con} \n` +
              `<b>Fuente de referencia:</b> ${fuente_referencia} \n` +
              `<b>Entrevistador:</b> ${entrevistador} \n` +
              `<b>Correo electrónico:</b> ${correo} \n` +
              `Muchas gracias por compartirnos tus datos, ten un buen día!!`,
        attachments: [{
          filename: 'osva.jpg',
          path: destination,
          cid: 'unique@osva.jpg' // Id único para la imagen en el correo
        }]
      };

      // Envío del correo electrónico
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Correo enviado: ' + info.response);
        }
      });
    });

    // Redireccionar al usuario a la página de inicio de sesión después de registrar
    res.redirect('/home');
  } catch (error) {
    // Manejar errores de forma adecuada
    console.error(error);
    res.status(500).send('Error en el registro de usuario');
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
  res.render('boni');
  //res.send('esta es la raiz pai')
});

///////////////////foticos/////////////
routes.get('/esquema', (req, res) => {
  res.render('esquema');
});

module.exports = routes;
