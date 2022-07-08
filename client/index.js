// 1 - Invocar a express
const express = require('express');
const app = express();

// 2 - Setear urlencoder para capturar datos de formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// 3 - invocar a dotenv

const dotenv = require('dotenv');
dotenv.config({path: './env/.env'})

// 4 - directorio public

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// 5 - editor de plantillas
app.set('view engine', 'ejs');

// 6 - invocar a bcryptjs

const bcryptjs = require('bcryptjs');
const { Session } = require('express-session');

// 7 - var session
const session = require('express-session')
app.use(session({
    secret: 'iesa2022',
    resave: true,
    saveUninitialized: true
}))

// 8 - Invocar a connection BD
const connection = require('./database/db');

// 9 - Establecer Rutas

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

// app.get('/admin', (req, res) => {
//     res.render('admin')
// })

app.get('/views', (req, res) => {
    res.sendFile(__dirname + '/views.html');
  });


// 10 - Registro

app.post('/register', async (req, res) => {
    const user = req.body.user;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const pass = req.body.pass;
    let passHash =  await bcryptjs.hash(pass, 8)

    connection.query('INSERT INTO usuarios SET ?', {user: user, name: nombre, email: email, pass: passHash}, async (error, results) =>{
        if(error){
            console.log(error)
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registro",
                alertMsj: '¡Realizado con éxito!',
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            })
        }
    })
})

// 11 - Auth

app.post('/auth', async (req, res) => {
    const user = req.body.user
    const pass = req.body.pass
    let passHash =  await bcryptjs.hash(pass, 8)
    
    if(user && pass){
        connection.query('SELECT * FROM usuarios WHERE user = ?', [user], async (err, results) => {
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMsj: 'Usuario / Contraseña incorrectas',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }else{
                req.session.loggedin = true
                req.session.name = results[0].name
                req.session.rol = results[0].rol
                res.render('login', {
                    alert: true,
                    alertTitle: "Login exitoso",
                    alertMsj: 'Has ingresado correctamente',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
        })
    }else{
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMsj: 'Llene todos los campos, por favor',
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
})

// 12 - auth pages
app.get('/', (req, res) => {
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.name
        })
    }else{
        res.redirect('login')
    }
})

app.get('/admin', (req, res) => {
    if(req.session.loggedin){
        res.render('admin', {
            login: true,
            name: req.session.name
        })
    }else{
        res.redirect('login')
    }
})

// 13 - Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() =>{
        res.redirect('/')
    })
})

// 14 - Socket.io
const { Server } = require("socket.io");
const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
});

// 15 - http y server
// const http = require('http');
// const server = http.createServer(app);


app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING: port 3000')
})