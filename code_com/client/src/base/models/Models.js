// models na jednom mjestu, da je server.js uredniji :)

const Sequelize = require('sequelize');
const sequelize = require('../baza.js');

const Korisnici = sequelize.import(__dirname + "/Korisnici.js");

const AdminiZaTakmicenja = sequelize.import(__dirname + "/AdminiZaTakmicenja.js");
AdminiZaTakmicenja.belongsTo(Korisnici);

const Razina = sequelize.import(__dirname + '/Razina.js');

const Takmicenja = sequelize.import(__dirname + "/Takmicenja.js");
Takmicenja.belongsTo(Razina);


const TakmicarskeGrupe = sequelize.import(__dirname + '/TakmicarskeGrupe.js');
TakmicarskeGrupe.belongsTo(Takmicenja);

const AdminiTakmicenja = sequelize.import(__dirname + '/AdminiTakmicenja.js');
Takmicenja.belongsToMany(AdminiZaTakmicenja, {through : AdminiTakmicenja});
AdminiZaTakmicenja.belongsToMany(Takmicenja, {through : AdminiTakmicenja});

const Zadaci = sequelize.import(__dirname + '/Zadaci.js');
Zadaci.belongsTo(TakmicarskeGrupe);

const Task = sequelize.import(__dirname + '/Task.js');
Task.belongsTo(Zadaci);

const Autotestovi = sequelize.import(__dirname + '/Autotestovi.js'); 
Autotestovi.belongsTo(Zadaci);

const ZadaciAdmini = sequelize.import(__dirname + '/ZadaciAdmini.js');
Zadaci.belongsToMany(AdminiZaTakmicenja, {through : ZadaciAdmini});
AdminiZaTakmicenja.belongsToMany(Zadaci, {through : ZadaciAdmini});

const Ucesnici = sequelize.import(__dirname + '/Ucesnici.js');
Ucesnici.belongsTo(Korisnici);

const Lokacija = sequelize.import(__dirname + '/Lokacija.js');
Ucesnici.belongsTo(Lokacija);

/*const Timovi = sequelize.import(__dirname + '/Timovi.js');
Ucesnici.belongsTo(Timovi);*/

const UcesniciTakmicarskeGrupe = sequelize.import(__dirname + '/UcesniciTakmicarskeGrupe.js');
Ucesnici.belongsToMany(TakmicarskeGrupe, {through : UcesniciTakmicarskeGrupe});
TakmicarskeGrupe.belongsToMany(Ucesnici, {through : UcesniciTakmicarskeGrupe});

const Verzije = sequelize.import(__dirname + '/Verzije.js');
Verzije.belongsTo(Zadaci);
Verzije.belongsTo(Ucesnici);

const AutotestoviRezultati = sequelize.import(__dirname + '/AutotestoviRezultati.js');
AutotestoviRezultati.belongsTo(Verzije);
AutotestoviRezultati.belongsTo(Autotestovi);

const Pitanja = sequelize.import(__dirname + '/Pitanja.js');
const Odgovori = sequelize.import(__dirname + '/Odgovori');
Odgovori.belongsTo(Pitanja);
Pitanja.belongsTo(Ucesnici);
Pitanja.belongsTo(Takmicenja);

const ZadatakTask = sequelize.import(__dirname + '/ZadatakTask.js');
Zadaci.belongsToMany(Task, {through : ZadatakTask});
Task.belongsToMany(Zadaci, {through : ZadatakTask});


sequelize.sync();

module.exports = function(db, DataTypes) {
	return {Korisnici, AdminiZaTakmicenja, Razina, Takmicenja, TakmicarskeGrupe, 
		AdminiTakmicenja, Zadaci, Task, Autotestovi, ZadaciAdmini, Ucesnici, Lokacija,
		UcesniciTakmicarskeGrupe, Verzije, AutotestoviRezultati, Pitanja, Odgovori, ZadatakTask};
}
