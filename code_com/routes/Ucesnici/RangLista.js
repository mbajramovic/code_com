const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');

const Sesija = require('../PomocneRute/Sesija.js');
const Odgovori = require('../ServerOdgovori.js');
const {Zadaci, Autotestovi, AutotestoviRezultati, Verzije, TakmicarskeGrupe, Ucesnici, Korisnici} = sequelize.import('../../client/src/base/models/Models');

module.exports = {
    getRangLista : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var takmicarskaGrupaId = req.query.takmicarskaGrupaId;
            var takmicarskeGrupeIDs = [];
            if (takmicarskaGrupaId == -1) {
                var takmicenjeId = req.query.takmicenjeId;

                TakmicarskeGrupe.findAll({
                    attributes : ['id'],
                    where : {
                        takmicenjaId : takmicenjeId
                    }
                })
                .then(grupe => {
                    for(var i = 0; i < grupe.length; i++) {
                        takmicarskeGrupeIDs.push(grupe[i].id);
                        if (i == grupe.length - 1)
                            getLista(takmicarskeGrupeIDs, req, res);
                    }

                })
                .catch(error => {
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                })
            }
            else {
                takmicarskeGrupeIDs.push(takmicarskaGrupaId);
                getLista(takmicarskeGrupeIDs, req, res);
            }
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}

function getLista(takmicarskeGrupeIDs, req, res) {
    Zadaci.findAll({
        attributes : ['id', 'redniBroj', 'naslov'],
        where : {
            takmicarskeGrupeId : takmicarskeGrupeIDs
        }
    })
    .then(_zadaci => {
        var zadaciIDs = [];
        for (let i = 0; i < _zadaci.length; i++)
            zadaciIDs[i] = _zadaci[i].id;

        Verzije.findAll({
            attributes : ['id', 'zadaciId'],
            where : {
                zadaciId : zadaciIDs
            }
        })
        .then(verzije => {
            var verzijeIDs = [];
            for (let i = 0; i < verzije.length; i++)
                verzijeIDs[i] = verzije[i].id;
            if (verzijeIDs.length == 0)
                verzijeIDs.push(-1);
            // ???
            sequelize.query(
               /* "SELECT `autotestovi_rezultati`.`id`, `autotestovi_rezultati`.`verzijeId`, `autotestovi_rezultati`.`bodovi`, `verzije`.`id` AS `verzije.id`, `verzije`.`bodovi` AS `verzije.bodovi`,`verzije`.`zadaciId` AS `verzije.zadaciId`, `verzije`.`ucesniciId` AS `verzije.ucesniciId`, `verzije->ucesnici`.`id` AS `verzije.ucesnici.id`, `verzije->ucesnici`.`ime` AS `verzije.ucesnici.ime`, `verzije->ucesnici`.`prezime` AS `verzije.ucesnici.prezime`, `verzije->ucesnici->korisnici`.`id` AS `verzije.ucesnici.korisnici.id`, `verzije->ucesnici->korisnici`.`korisnickoIme` AS `verzije.ucesnici.korisnici.korisnickoIme`, " + 
                "`verzije->ucesnici->lokacija`.`skola` as `verzije.ucesnici.lokacija.skola`, `verzije->ucesnici->lokacija`.`grad` as `verzije.ucesnici.lokacija.grad`, `verzije->ucesnici->lokacija`.`opcina` as `verzije.ucesnici.lokacija.opcina`, `verzije->ucesnici->lokacija`.`kanton` as `verzije.ucesnici.lokacija.kanton`, `verzije->ucesnici->lokacija`.`drzava` as `verzije.ucesnici.lokacija.drzava`, " + 
                "`verzije->zadaci`.`id` AS `verzije.zadaci.id`, `verzije->zadaci`.`redniBroj` AS `verzije.zadaci.redniBroj`, `verzije->zadaci`.`naslov` AS `verzije.zadaci.naslov`, `autotestovi`.`id` AS `autotestovi.id` FROM `autotestovi_rezultatis` AS `autotestovi_rezultati` " + 
                "LEFT OUTER JOIN `verzijes` AS `verzije` ON `autotestovi_rezultati`.`verzijeId` = `verzije`.`id` LEFT OUTER JOIN `ucesnicis` AS `verzije->ucesnici` ON `verzije`.`ucesniciId` = `verzije->ucesnici`.`id` LEFT OUTER JOIN `korisnicis` AS `verzije->ucesnici->korisnici` ON `verzije->ucesnici`.`korisniciId` = `verzije->ucesnici->korisnici`.`id` LEFT OUTER JOIN `lokacijas` as `verzije->ucesnici->lokacija` ON `verzije->ucesnici`.`lokacijaId` = `verzije->ucesnici->lokacija`.`id` LEFT OUTER JOIN `zadacis` AS `verzije->zadaci` ON `verzije`.`zadaciId` = `verzije->zadaci`.`id` LEFT OUTER JOIN `autotestovis` AS `autotestovi` ON `autotestovi_rezultati`.`autotestoviId` = `autotestovi`.`id` WHERE `autotestovi_rezultati`.`verzijeId` = " +
                "(SELECT MAX(`autotestovi_rezultatis`.`verzijeId`) FROM `autotestovi_rezultatis`, `verzijes` WHERE `autotestovi_rezultatis`.`verzijeId` = `verzijes`.`id` AND `verzijes`.`ucesniciId` = `verzije`.`ucesniciId` and `verzijes`.`zadaciId` = `verzije`.`zadaciId`) AND " +
                " `autotestovi_rezultati`.`verzijeId` IN (" + verzijeIDs.toString() + ")"*/
                "SELECT  `verzije`.`id` AS `verzije.id`, `verzije`.`bodovi` AS `verzije.bodovi`,`verzije`.`zadaciId` AS `verzije.zadaciId`, `verzije`.`ucesniciId` AS `verzije.ucesniciId`, `verzije->ucesnici`.`id` AS `verzije.ucesnici.id`, `verzije->ucesnici`.`ime` AS `verzije.ucesnici.ime`, `verzije->ucesnici`.`prezime` AS `verzije.ucesnici.prezime`, `verzije->ucesnici->korisnici`.`id` AS `verzije.ucesnici.korisnici.id`, `verzije->ucesnici->korisnici`.`korisnickoIme` AS `verzije.ucesnici.korisnici.korisnickoIme`, "+
                "`verzije->ucesnici->lokacija`.`skola` as `verzije.ucesnici.lokacija.skola`, `verzije->ucesnici->lokacija`.`grad` as `verzije.ucesnici.lokacija.grad`, `verzije->ucesnici->lokacija`.`opcina` as `verzije.ucesnici.lokacija.opcina`, `verzije->ucesnici->lokacija`.`kanton` as `verzije.ucesnici.lokacija.kanton`, `verzije->ucesnici->lokacija`.`drzava` as `verzije.ucesnici.lokacija.drzava`," +
                "`verzije->zadaci`.`id` AS `verzije.zadaci.id`, `verzije->zadaci`.`redniBroj` AS `verzije.zadaci.redniBroj`, `verzije->zadaci`.`naslov` AS `verzije.zadaci.naslov` FROM `verzijes` AS `verzije` "+
                "LEFT OUTER JOIN `ucesnicis` AS `verzije->ucesnici` ON `verzije`.`ucesniciId` = `verzije->ucesnici`.`id` LEFT OUTER JOIN `korisnicis` AS `verzije->ucesnici->korisnici` ON `verzije->ucesnici`.`korisniciId` = `verzije->ucesnici->korisnici`.`id` LEFT OUTER JOIN `lokacijas` as `verzije->ucesnici->lokacija` ON `verzije->ucesnici`.`lokacijaId` = `verzije->ucesnici->lokacija`.`id` LEFT OUTER JOIN `zadacis` AS `verzije->zadaci` ON `verzije`.`zadaciId` = `verzije->zadaci`.`id`  WHERE `verzije`.`id` = "+ 
                "(SELECT MAX(`autotestovi_rezultatis`.`verzijeId`) FROM `autotestovi_rezultatis`, `verzijes` WHERE `autotestovi_rezultatis`.`verzijeId` = `verzijes`.`id` AND `verzijes`.`ucesniciId` = `verzije`.`ucesniciId` and `verzijes`.`zadaciId` = `verzije`.`zadaciId`) AND "+
                "`verzije`.`id` IN (" + verzijeIDs.toString() + ") ORDER BY `verzije.id` DESC"
            )
            .then(rezultati => {

                var ucesnici = [],
                    ucesniciIDs = [];
                for (let i = 0; i < 1; i++) {
                    for (let j = 0; j < rezultati[i].length; j++) {
                        var id = rezultati[i][j]['verzije.ucesniciId'].toString();
                        if (!ucesnici[id]) {
                            ucesnici[id] = [];
                            ucesniciIDs.push(id);
                        }
                        ucesnici[id].push(rezultati[i][j]);
                    }
                }
                var ucesnici_zadaci = [];
                for (let i = 0; i < ucesniciIDs.length; i++) {
                    var item = {
                        'ucesnikId' : ucesniciIDs[i],
                        'zadaci' : []
                    };
                    var zadaci = [];
                    var ukupno = 0.0;
                    var ukupno_zadatak = 0;
                    for (var p = 0; p < _zadaci.length; p++) {
                        zadaci[p] = {'zadatakId' :_zadaci[p].id, 'rezultati' : [], 'ukupno' : 0, 'redniBroj' : _zadaci[p].redniBroj, 'naslov' : _zadaci[p].naslov};
                    }
                    for(let j = 0; j < ucesnici[ucesniciIDs[i]].length; j++) {
                        var z = ucesnici[ucesniciIDs[i]][j];
                        var autotest = {};
                        zadaci[z['verzije.zadaci.redniBroj'] - 1].rezultati.push(autotest);
                        zadaci[z['verzije.zadaci.redniBroj'] - 1].ukupno = Math.round(z['verzije.bodovi'] * 100)/100;
                        ukupno += Math.round(z['verzije.bodovi'] * 100)/100;
                    }
                    zadaci.sort(function(a, b) {
                        a.redniBroj - b.redniBroj
                    });
                    item.zadaci = zadaci;
                    item.ukupno = ukupno
                    item.korisnickoIme = z['verzije.ucesnici.korisnici.korisnickoIme'];
                    item.ime = z['verzije.ucesnici.ime'];
                    item.prezime = z['verzije.ucesnici.prezime'];

                    var lokacija = {
                        'skola' : z['verzije.ucesnici.lokacija.skola'],
                        'grad' : z['verzije.ucesnici.lokacija.grad'],
                        'opcina' : z['verzije.ucesnici.lokacija.opcina'],
                        'kanton' : z['verzije.ucesnici.lokacija.kanton'],
                        'drzava' : z['verzije.ucesnici.lokacija.drzava']
                    };

                    item.lokacija = lokacija;
                    ucesnici_zadaci.push(item);
                }
                var objekat = {'brojZadataka' : zadaciIDs.length, 'ranglista' : ucesnici_zadaci};
                
                if (req.query.vrsta == 'ucesnici') {
                    ucesnici_zadaci.sort(function(a, b) {
                        return b.ukupno - a.ukupno
                    });
                    
                    res.end(JSON.stringify({
                        'data' : ucesnici_zadaci,
                        'zadaci' : _zadaci
                    }));
                }
                else  {
                    var filter = req.query.vrsta;
                    var sortNiz = [],
                        finalNiz = [],
                        items = [];
                    for (var i = 0; i < ucesnici_zadaci.length; i++) {
                        var item = ucesnici_zadaci[i].lokacija[filter];
                        if (sortNiz[item] == null) {
                            sortNiz[item] = {'item' : item, 'info' : null, 'bodovi' : 0};
                            items.push(item);
                        }
                        sortNiz[item].bodovi += ucesnici_zadaci[i].ukupno;
                        sortNiz[item].info = ucesnici_zadaci[i];
                    }
                    console.log(sortNiz); 
                    for (var i = 0; i < items.length; i++)
                        finalNiz.push(sortNiz[items[i]]);
                        
                    finalNiz.sort(function(a, b) {
                        return b.bodovi - a.bodovi
                    });
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'data' : finalNiz,
                        'zadaci' : _zadaci
                    }));
                }
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
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

