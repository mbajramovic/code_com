const express = require('express'); 
const session = require("express-session");
const bodyParser = require('body-parser'); 
const fs = require('fs'); 
const app = express(); 
const routes = express.Router();
const csv = require('csvtojson');
const path = require('path');
const bcrypt = require('bcrypt'); 
var htmlencode = require('htmlencode').htmlEncode;
const Sequelize = require('sequelize');
const sequelize = require('./client/src/base/baza.js');
const socket = require('socket.io');
var request = require('request');
const Op = Sequelize.Op;

server = app.listen(5000);

// routes
var toBuildservice = require('./routes/Zadaci/ToBuildservice.js'),
    masovniUnosUcesnikaCSV = require('./routes/Ucesnici/MasovniUnosCSV.js'),
    rjesenje = require('./routes/Buildservice/Rjesenje.js'),
    novaVerzija = require('./routes/Buildservice/NovaVezija.js'),
    router = require('./routes/routes.js'); // ostale rute



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'Mk9292iksk9e9e9edj1jkdikL',
    resave: true,
    saveUninitialized: true
}));
app.use('/', router);

app.use(express.static('./autotest-generator/html'));
app.use(express.static('./autotest-generator/css'));
app.use(express.static('./autotest-generator/bootstrap/css'));
app.use(express.static('./autotest-generator/scripts'));


app.use('/toBuildservice', toBuildservice);
app.use('/novaVerzija', novaVerzija);
app.use('/masovniUnosUcesnikaCSV', masovniUnosUcesnikaCSV);
app.use('/rjesenje', rjesenje);


// notify
io = socket(server);
io.on('connection', (socket) => {
    socket.on('OBAVIJESTI_ADMINISTRATORE', function(data){
        Ucesnici.findOne({
            include : [
                {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme']}
            ],
            where : {
                id : data.verzija.ucesnikId
            }
        })
        .then(ucesnik => {
            data.verzija.korisnickoIme = ucesnik.korisnici.korisnickoIme;
            io.emit('NOVA_VERZIJA', data);
            io.emit('RANG_LISTA', data);
        })
    });
    socket.on('TIMER', function(data) {
        console.log(data);
        Takmicenja.findOne({
            where : {
                id : data.id
            }
        })
        .then(takmicenje => {
            takmicenje.updateAttributes({
                aktivno : false,
                zavrseno : true
            })
            .then(done => {
                io.emit('KRAJ_TAKMICENJA', data);
            })
        });
        //io.emit('KRAJ_TAKMICENJA', data);
    });
    socket.on('NOVO_PITANJE', function(data) {
        Ucesnici.findOne({
            include : [
                {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme']}
            ],
            where : {
                id : data.pitanje.ucesniciId
            }
        })
        .then(ucesnik => {
            data.pitanje.ucesnici = {
                'id' : ucesnik.id,
                'korisnici' : {
                    'korisnickoIme' : ucesnik.korisnici.korisnickoIme
                }
            };        
            io.emit('NOVO_PITANJE', data);
        });
        Pitanja.findAll({
            where : {
                takmicenjaId : data.pitanje.takmicenjaId,
                odgovoreno : false
            }
        })
        .then(pitanja => {
            io.emit('NOVO_PITANJE_PREGLED', pitanja.length);
        });
    });

    socket.on('NOVI_ODGOVOR', function(data) {
        var odgovor = data.odgovor;
        if (odgovor.odgovorZaSve == true) {
            UcesniciTakmicarskeGrupe.findAll({
                where : {
                    ucesniciId : odgovor.ucesnikId
                },
                attributes : ['takmicarskeGrupeId']
            })
            .then(takmicarskeGrupe => {
                for (let i = 0; i < takmicarskeGrupe.length; i++) {
                   UcesniciTakmicarskeGrupe.findAll({
                       where : {
                           takmicarskeGrupeId : takmicarskeGrupe[i].takmicarskeGrupeId
                       },
                       attributes : ['ucesniciId']
                   })
                   .then(ucesnici => {
                       for (let j = 0; j < ucesnici.length; j++)
                            io.emit('NOVI_ODGOVOR' + ucesnici[j].ucesniciId, data);
                   })
                }
            });
        }
        else 
            io.emit('NOVI_ODGOVOR' + odgovor.ucesnikId, data);
        
        io.emit('NOVI_ODGOVOR_PREGLED', 'minus');
        
    })
});

// models
const {Korisnici, AdminiZaTakmicenja, Razina, Takmicenja, TakmicarskeGrupe, AdminiTakmicenja, Zadaci, Autotestovi, ZadaciAdmini,
       Ucesnici, Lokacija, UcesniciTakmicarskeGrupe, Pitanja, Odgovori} = sequelize.import(__dirname + '/client/src/base/models/Models.js');


