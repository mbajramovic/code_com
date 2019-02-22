var express = require('express');

var pitanja = require('./Pitanja/PitanjaControler.js');
var pdf = require('./PDF/PdfControler.js');
var rangLista = require('./Ucesnici/RangLista.js');
var programStatus = require('./Buildservice/GetProgramStatus.js');
var pocetakTakmicenja = require('./Buildservice/OtvoriTakmicenje.js');
var verzije = require('./Zadaci/PredaneVerzijeControler.js');
var pomocneRute = require('./PomocneRute/HelpersControler.js');
var ATGenerator = require('./Zadaci/Testovi/TestoviControler.js');

var getTakmicenja = require('./Takmicenja/GetTakmicenjaControler.js');
var postTakmicenja = require('./Takmicenja/PostTakmicenjaControler.js');
var admini = require('./Takmicenja/AdminiControler.js');

var getZadaci = require('./Zadaci/GetZadaciControler.js');
var postZadaci = require('./Zadaci/PostZadaciControler.js');

var getUcesnici = require('./Ucesnici/GetUcesniciControler.js');
var postUcesnici = require('./Ucesnici/PostUcesniciControler.js');




var router = express.Router();

// R U T E

// pitanja
router.route('/novoPitanje').post(pitanja.novoPitanje);
router.route('/noviOdgovor').post(pitanja.odgovorNaPitanje);
router.route('/svaPitanja').get(pitanja.povuciSvaPitanja);
router.route('/pitanjaZaUcesnika').get(pitanja.povuciPitanjaZaUcesnika);

// takmicenja
router.route('/takmicenja').get(getTakmicenja.getTakmicenja);
router.route('/takmicenje').get(getTakmicenja.getTakmicenje);
router.route('/novoTakmicenje').post(postTakmicenja.novoTakmicenje);
router.route('/updateTakmicenja').post(postTakmicenja.updateTakmicenje);
router.route('/ekstenzija').get(getTakmicenja.getEkstenziju);
router.route('/brisiTakmicenje').get(getTakmicenja.brisiTakmicenje);

//admini
router.route('/noviAdmin').post(admini.noviAdmin);
router.route('/admini').get(admini.getAdmine);


// zadaci
router.route('/zadaci').get(getZadaci.getZadaci);
router.route('/zadatak').get(getZadaci.getZadatak);
router.route('/zadaciZaUcesnika').get(getZadaci.zadaciZaUcesnika);
router.route('/noviZadatak').post(postZadaci.noviZadatak);
router.route('/urediZadatak').post(postZadaci.updateZadatak);
router.route('/jeziciZaZadatak').get(getZadaci.getJeziciZaZadatak);

// verzije
router.route('/predaneVerzije').get(verzije.getVerzijeZaUcesnika);
router.route('/verzijeOsoblje').get(verzije.getVerzijeZaOsoblje);
router.route('/rjesenje').get(verzije.getRjesenje);
router.route('/najnovijaVerzija').get(verzije.getNajnovijaVerzija);

//ucesnici
router.route('/noviUcesnik').post(postUcesnici.noviUcesnik);
router.route('/masovniUnosBrojUcesnika').post(postUcesnici.masovniUnosPoBrojuUcesnika);
router.route('/updateUcesnika').post(postUcesnici.urediUcesnika);
router.route('/ucesnik').get(getUcesnici.getUcesnik);
router.route('/ucesnici').get(getUcesnici.getUcesnici);
router.route('/brisiUcesnika').get(getUcesnici.brisiUcesnika);
router.route('/informacijeOTakmicenju').get(getUcesnici.informacijeOTakmicenju);

// autotestovi
router.route('/openGenerator').get(ATGenerator.openGenerator);
router.route('/autotestovi').get(ATGenerator.getAutotestovi);
router.route('/autotestovi').post(ATGenerator.postAutotestovi);

// rang lista ucesnika
router.route('/rangLista').get(rangLista.getRangLista);

//pdf
router.route('/zadaciUPdf').post(pdf.zadaci);
router.route('/pristupniPodaci').post(pdf.ucesnici);

// buildservice
router.route('/getProgramStatus').get(programStatus.getProgramStatus);
router.route('/otvoriTakmicenje').post(pocetakTakmicenja.otvoriTakmicenje);

// pomocne rute
router.route('/login').post(pomocneRute.login);
router.route('/logout').get(pomocneRute.logout);
router.route('/download').get(pomocneRute.download);

module.exports = router;
