const Sesija = (() => {
    const ulogovaniKorisnici = [];

    const isOK = (korisnik) => {
        console.log('hi');
        console.log(ulogovaniKorisnici);
        console.log(korisnik.korisnickoIme);
        console.log(korisnik.token);
        return nadjiKorisnika(korisnik) !== undefined;
    }

    const dodajKorisnika = (korisnik) => {
        if(!isOK(korisnik)) {
            ulogovaniKorisnici.push(korisnik);
            console.log(ulogovaniKorisnici);
            return true;
        }
        return false;
    }

    const nadjiKorisnika = (korisnik) => {
        const nadjeniKorisnik = ulogovaniKorisnici.find((k) => {
            return k.korisnickoIme == korisnik.korisnickoIme && k.token == korisnik.token
        });
        return nadjeniKorisnik;
    }

    const brisiKorisnika = (korisnik) => {
        if (isOK(korisnik)) {
            for(let i = 0; i < ulogovaniKorisnici.length; i++) {
                var kor = ulogovaniKorisnici[i];
                if (kor.korisnickoIme == korisnik.korisnickoIme && kor.token == korisnik.token) {
                    ulogovaniKorisnici.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    return {
        isOK : isOK,
        dodajKorisnika : dodajKorisnika,
        brisiKorisnika : brisiKorisnika
    }
})();

module.exports = Sesija;