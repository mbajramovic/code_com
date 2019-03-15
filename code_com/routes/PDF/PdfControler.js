const PDFDocument = require('pdfkit');
const fs = require('fs');
const sequelize = require('../../client/src/base/baza.js');

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Zadaci, TakmicarskeGrupe, Takmicenja, Ucesnici, UcesniciTakmicarskeGrupe, Korisnici, AdminiZaTakmicenja, Lokacija} = sequelize.import('../../client/src/base/models/Models');

//var content = '';

module.exports = { 
    zadaci : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            const doc = new PDFDocument();
            var takmGrupaId = req.body.takmicarskaGrupaId;
            var content = '';
            Zadaci.findAll({
                where : {
                    takmicarskeGrupeId : takmGrupaId
                },

                order : [
                    ['redniBroj', 'ASC']
                ]
            })
            .then(zadaci => {
                TakmicarskeGrupe.findOne({
                    include : [
                        {model : Takmicenja, as : 'takmicenja', attributes : ['pocetak', 'naziv']}
                    ],
                    where : {
                        id : takmGrupaId
                    }
                })
                .then(rezultat => {
                    var takmicenje = rezultat.takmicenja.dataValues;
                    content += takmicenje.pocetak + "\n" + takmicenje.naziv + "\n\n\n";
                    let i = 0;
                    zadaci.forEach(zadatak => {
                        //jos urediti 
                        content += "Zadatak "  + zadatak.redniBroj + ".\nNaslov: " + zadatak.naslov + '\nTekst: ' + zadatak.tekst + '\n\nUlaz: ' + zadatak.ulaz + '\nOcekivani izlaz: ' + zadatak.izlaz + '\n\n\n\n'; 
                        if (zadatak.redniBroj == zadaci.length) {
                            var filename = 'Zadaci.pdf';
                            doc.pipe(fs.createWriteStream(filename));
                            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
                            res.setHeader('Content-type', 'application/pdf');
                            doc.y = 300;
                            doc.font('fonts/News_Cycle/NewsCycle-Regular.ttf').text(content, 50, 50);
                            doc.pipe(res);
                            doc.end();
                        }
                    }); 
                })
            })
            .catch(error => {
                doc.end();
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    ucesnici : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var takmGrupaId = req.body.takmicarskaGrupaId;
            UcesniciTakmicarskeGrupe.findAll({
                where : {
                    takmicarskeGrupeId : takmGrupaId
                }
            })
            .then(ucesnici => {
                var ucesniciIDs = [];
                for (let i = 0; i < ucesnici.length; i++)
                    ucesniciIDs.push(ucesnici[i].ucesniciId);
                Ucesnici.findAll({ 
                    include : [
                        {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme', 'lozinka']}
                    ],
                    where : {
                        id : ucesniciIDs
                    }
                })
                .then(_ucesnici => {
                    var doc = new PDFDocument();
                    var writeStream = fs.createWriteStream('Ucesnici.pdf');
                    doc.pipe(writeStream);
                    doc.lineCap('butt').moveTo(180, 90).lineTo(180, 90 + 20 * (_ucesnici.length + 1)).stroke();
                    doc.lineCap('butt').moveTo(360, 90).lineTo(360, 90 + 20 * (_ucesnici.length + 1)).stroke();
                    row(doc, 90);
                    textInHeading(doc, 'Korisničko ime', 30, 93);
                    textInHeading(doc, 'Lozinka', 183, 93);
                    textInHeading(doc, 'Potpis', 363,93);
                    for (let i = 0; i < _ucesnici.length; i++) {
                        let ucesnik = _ucesnici[i].dataValues;
                        row(doc, 90 + 20 * (i+1));
                        textInRowFirst(doc, ucesnik.korisnici.dataValues.korisnickoIme, 30, 93 + 20 * (i+1));
                        textInRowFirst(doc, ucesnik.korisnici.dataValues.lozinka, 183, 93 + 20 * (i + 1));
                    }
                    doc.end();
                    writeStream.on('finish', function () {
                      // do stuff with the PDF file
                      res.end();
                    
                    });
                })
                .catch(error => {
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    ucesniciSaPodacima : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola === 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var takmGrupaId = req.body.takmicarskaGrupaId;
            UcesniciTakmicarskeGrupe.findAll({
                where : {
                    takmicarskeGrupeId : takmGrupaId
                }
            })
            .then(ucesnici => {
                var ucesniciIDs = [];
                for (let i = 0; i < ucesnici.length; i++)
                    ucesniciIDs.push(ucesnici[i].ucesniciId);
                Ucesnici.findAll({ 
                    include : [
                        {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme', 'lozinka']},
                        {model : Lokacija, as : 'lokacija', attributes : ['skola']}
                    ],
                    where : {
                        id : ucesniciIDs
                    }
                })
                .then(_ucesnici => {
                    var doc = new PDFDocument({bufferPages : true});
                    var writeStream = fs.createWriteStream('UcesniciSaPodacima.pdf');
                    doc.pipe(writeStream);

                    doc.lineCap('butt').moveTo(108, 90).lineTo(108, 90 + 20 * (30+ 1)).stroke();
                    doc.lineCap('butt').moveTo(216, 90).lineTo(216, 90 + 20 * (30 + 1)).stroke();
                    doc.lineCap('butt').moveTo(324, 90).lineTo(324, 90 + 20 * (30 + 1)).stroke();
                    doc.lineCap('butt').moveTo(432, 90).lineTo(432, 90 + 20 * (30 + 1)).stroke();
                    row(doc, 90);
                    textInHeading(doc, 'Ime', 30, 93);
                    textInHeading(doc, 'Prezime', 111, 93);
                    textInHeading(doc, 'Škola', 219, 93);
                    textInHeading(doc, 'Korisničko ime', 327, 93);
                    textInHeading(doc, 'Lozinka', 435, 93);
                    var stranice = 0;
                    var brojac = 0;
                    for (let i = 0; i < _ucesnici.length; i++) {
                        let ucesnik = _ucesnici[i].dataValues;
                      
                        row(doc, 90 + 20 * (brojac+1));
                        textInRowFirst(doc, ucesnik.ime, 30, 93 + 20 * (brojac+1));
                        textInRowFirst(doc, ucesnik.prezime, 111, 93 + 20 * (brojac+1));
                        textInRowFirst(doc, ucesnik.lokacija.dataValues.skola, 219, 93 + 20 * (brojac+1));
                        textInRowFirst(doc, ucesnik.korisnici.dataValues.korisnickoIme, 327, 93 + 20 * (brojac+1));
                        textInRowFirst(doc, ucesnik.korisnici.dataValues.lozinka, 435, 93 + 20 * (brojac+1));
                        brojac++;
                        if (i % 29 == 0 && i != 0) {
                            doc.addPage();
                            doc.switchToPage(++stranice);
                            doc.lineCap('butt').moveTo(108, 90).lineTo(108, 90 + 20 * (30 + 1)).stroke();
                            doc.lineCap('butt').moveTo(216, 90).lineTo(216, 90 + 20 * (30 + 1)).stroke();
                            doc.lineCap('butt').moveTo(324, 90).lineTo(324, 90 + 20 * (30 + 1)).stroke();
                            doc.lineCap('butt').moveTo(432, 90).lineTo(432, 90 + 20 * (30 + 1)).stroke();
                            brojac = 0;
                        }
                    }
                    doc.end();
                    writeStream.on('finish', function () {
                      // do stuff with the PDF file
                      res.end();
                    
                    });
                })
                .catch(error => {
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else   
            res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
    },

    administratori : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola === 'administrator' && Sesija.isOK(korisnik)) {
            AdminiZaTakmicenja.findAll({
                attributes : ['ime', 'prezime', 'korisniciId'],
                include : [
                   {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme', 'lozinka']}
                ]
            })
            .then(administratori => {
                var doc = new PDFDocument();
                var writeStream = fs.createWriteStream('Administratori.pdf');
                doc.pipe(writeStream);
                doc.lineCap('butt').moveTo(135, 90).lineTo(135, 90 + 20 * (administratori.length + 1)).stroke();
                doc.lineCap('butt').moveTo(270, 90).lineTo(270, 90 + 20 * (administratori.length + 1)).stroke();
                doc.lineCap('butt').moveTo(405, 90).lineTo(405, 90 + 20 * (administratori.length + 1)).stroke();
                row(doc, 90);
                textInHeading(doc, 'Ime', 30, 93);
                textInHeading(doc, 'Prezime', 137, 93);
                textInHeading(doc, 'Korisničko ime', 272, 93);
                textInHeading(doc, 'Lozinka', 407, 93);
                for (let i = 0; i < administratori.length; i++) {
                    let administrator = administratori[i].dataValues;
                    row(doc, 90 + 20 * (i+1));
                    textInRowFirst(doc, administrator.ime, 30, 93 + 20 * (i+1));
                    textInRowFirst(doc, administrator.prezime, 137, 93 + 20 * (i+1));
                    textInRowFirst(doc, administrator.korisnici.dataValues.korisnickoIme, 272, 93 + 20 * (i+1));
                    textInRowFirst(doc, administrator.korisnici.dataValues.lozinka, 407, 93 + 20 * (i+1));
                }
                doc.end();
                writeStream.on('finish', function () {
                  // do stuff with the PDF file
                  res.end();
                
                });
            })
           

        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED)); 
    },

    rangLista : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola === 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var lista = req.body.lista;
            console.log(lista);
            var zadaci = req.body.zadaci;
            var doc = new PDFDocument();
            var writeStream = fs.createWriteStream('RangLista.pdf');
            doc.pipe(writeStream);
            doc.lineCap('butt').moveTo(100,90).lineTo(100, 90 + 20 * (lista.length + 1)).stroke();
            doc.lineCap('butt').moveTo(250, 90).lineTo(250, 90 + 20 * (lista.length + 1)).stroke();
            //doc.lineCap('butt').moveTo(300, 90).lineTo(300, 90 + 20 * (ista.length + 1)).stroke();
            for (var i = 0; i < zadaci.length; i++)  {
                doc.lineCap('butt').moveTo(250 + 45 * (i + 1),90).lineTo(250 + 45 * (i + 1), 90 + 20 * (lista.length + 1)).stroke();
            }
            //doc.lineCap('butt').moveTo(250 + 30 * (zadaci.length + 1),90).lineTo(250 + 30 * (zadaci.length + 1), 90 + 20 * (lista.length + 1)).stroke();
            row(doc, 90);
           textInHeading(doc, 'Plasman', 30, 93);
            textInHeading(doc, 'Učesnik', 102, 93);
            for (var i = 0; i < zadaci.length; i++)
                textInHeading(doc, 'Z' + (i+1), 252 + 45 * (i), 93);
            textInHeading(doc, 'Ukupno', 252 + 45 * (zadaci.length), 93);
            for (var i = 0; i < lista.length; i++) {
                row(doc, 90 + 20 * (i + 1));
                textInRowFirst(doc, (i+1).toString(), 30, 93 + 20*(i+1));
                textInRowFirst(doc, lista[i].korisnickoIme, 102, 93 + 20*(i+1));
                for (var j = 0; j < zadaci.length; j++) {
                    textInRowFirst(doc, lista[i].zadaci[j].ukupno, 252 + 45*j, 93 + 20*(i+1));
                }
                textInRowFirst(doc, lista[i].ukupno, 252 + 45*(zadaci.length), 93 + 20 *(i+1));
            }
            doc.end();
            writeStream.on('finish', function () {
              // do stuff with the PDF file
              res.end();
            
            });
            
        }
        else {
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
        }
    },

    rangListaSaPodacima : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola === 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var lista = req.body.lista;
            console.log(lista);
            var zadaci = req.body.zadaci;
            var doc = new PDFDocument();
            var writeStream = fs.createWriteStream('RangListaP.pdf');
            doc.pipe(writeStream);
            doc.lineCap('butt').moveTo(100,90).lineTo(100, 90 + 20 * (lista.length + 1)).stroke();
            doc.lineCap('butt').moveTo(200, 90).lineTo(200, 90 + 20 * (lista.length + 1)).stroke();
            doc.lineCap('butt').moveTo(320, 90).lineTo(320, 90 + 20 * (lista.length + 1)).stroke();

            //doc.lineCap('butt').moveTo(300, 90).lineTo(300, 90 + 20 * (ista.length + 1)).stroke();
            for (var i = 0; i < zadaci.length; i++)  {
                doc.lineCap('butt').moveTo(320 + 35 * (i + 1),90).lineTo(320 + 35 * (i + 1), 90 + 20 * (lista.length + 1)).stroke();
            }
            //doc.lineCap('butt').moveTo(250 + 30 * (zadaci.length + 1),90).lineTo(250 + 30 * (zadaci.length + 1), 90 + 20 * (lista.length + 1)).stroke();
            row(doc, 90);
            textInHeading(doc, 'Plasman', 30, 93);
            textInHeading(doc, 'Učesnik', 102, 93);
            textInHeading(doc, 'Škola', 202, 93);
            for (var i = 0; i < zadaci.length; i++)
                textInHeading(doc, 'Z' + (i+1), 320 + 35 * (i), 93);
            textInHeading(doc, 'Ukupno', 320 + 35 * (zadaci.length), 93);
            for (var i = 0; i < lista.length; i++) {
                row(doc, 90 + 20 * (i + 1));
                textInRowFirst(doc, (i+1).toString(), 30, 93 + 20*(i+1));
                textInRowFirst(doc, lista[i].ime + ' ' + lista[i].prezime, 102, 93 + 20*(i+1));
                textInRowFirst(doc, lista[i].lokacija.skola, 202, 93 + 20*(i+1));

                for (var j = 0; j < zadaci.length; j++) {
                    textInRowFirst(doc, lista[i].zadaci[j].ukupno, 320 + 35*j, 93 + 20*(i+1));
                }
                textInRowFirst(doc, lista[i].ukupno, 320 + 35*(zadaci.length), 93 + 20 *(i+1));
            }
            doc.end();
            writeStream.on('finish', function () {
              // do stuff with the PDF file
              res.end();
            
            });
            
        }
        else {
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
        }
    }
}

function textInRowFirst(doc, text, x, heigth) {
    doc.y = heigth;
    doc.x = x;
    doc.fillColor('black')
    doc.font('fonts/News_Cycle/NewsCycle-Regular.ttf').text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    return doc
  }
  
  function textInHeading(doc, text, x, heigth) {
    doc.y = heigth;
    doc.x = x;
    doc.fillColor('black')
    doc.font('fonts/News_Cycle/NewsCycle-Bold.ttf').text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    return doc
  }
  

  
  function row(doc, heigth) {
    doc.lineJoin('miter')
      .rect(30, heigth, 500, 20)
      .stroke()
     
    return doc
  }