// Importar los módulos necesarios
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const connectMongoDB = require('./utilis/connection');
const main_routes = require('./routes/main_routes');
// Usar el middleware 'flash'
const flash = require('connect-flash');
// Crear una instancia de la aplicación Express
const session = require('express-session');
const passport = require('passport');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));
//app requiere passport 
app.use(passport.initialize());
app.use(passport.session());
//alarmas
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//python
const { spawn } = require('child_process');

const pythonProcess = spawn('python', ["./python/alarm.py"
]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`Proceso de Python finalizado con código ${code}`);
});

const dotenv = require('dotenv');
app.use(express.static("estatico"));

const moment = require('moment');

connectMongoDB();
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', main_routes);
app.use("/fonts", express.static(path.join(__dirname, 'src/fonts')));
app.set('view engine', 'ejs');
//requerimos passport para el login
//declaramos la route de donde lo vamos a sacar 
//siempre que requiramos una carpeta o archivo usamos el function requiere´

//---------------------------CONTEO------------------------
// Iniciar el servidor en el puerto 3000
dotenv.config();

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor en el puerto ${port}`);
});