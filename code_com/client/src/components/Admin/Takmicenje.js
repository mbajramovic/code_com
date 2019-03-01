// takmičenja (dodavanje i uređjivanje) za administratora sistema

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import registerServiceWorker from '../../registerServiceWorker';

import Sesija from '../Sesija.js';

import styles from '../../css/AdminPage.css';
const axios = require('axios');

class Takmicenje extends Component {
    constructor(props) {
        super(props);

        this.state = {
            naziv : '',
            datumPocetka : null,
            datumZavrsetka : null,
            nivo : '',
            opis : '',
            brojTakmicarskihGrupa : 1,
            clanoviKomisije : [],
            takmicarskeGrupe : [],
            grupe : [],
            admini : null,
            listaAdmina : [],
            programskiJezik : 'Jezik',
            tipDatoteke : '.tip',

            poruka : null,
            greska : null,
            greskaUnosa : null,

            takmicenje : null,
            grupeZaUrediti : null,

            takmicarskiAdmini : []
        }

        if (this.props.match != null) 
            this.povuciTakmicenje(this.props.match.params.takmicenjeId);
        
        this.prikaziGrupe = this.prikaziGrupe.bind(this);
        this.povuciAdmine = this.povuciAdmine.bind(this);
       
    }

    componentWillMount() {
        this.povuciAdmine();
    }

    nazivUpdate(event) {
        this.setState({ naziv : event.target.value })
    }

    datumPocetkaUpdate(event) {
        this.setState({ datumPocetka : event.target.value })
    }

    datumZavrsetkaUpdate(event) {
        this.setState({ datumZavrsetka : event.target.value })
    }

    nivoUpdate(event) {
        this.setState({ nivo : event.target.value })
    }

    opisUpdate(event) {
        this.setState({ opis : event.target.value })
    }

    brojGrupaUpdate(event) {
        this.setState({ brojTakmicarskihGrupa : event.target.value })
    }

    programskiJezikUpdate(event) {
        this.setState({programskiJezik : event.target.value});
    }

    tipDatotekeUpdate(event) {
        this.setState({tipDatoteke : event.target.value})
    }

    onChange(value, key) {
        if (key == 'brojGrupa') {
            var tGrupe = this.state.grupeZaUrediti;
            if (value > tGrupe.length) {
                for (var i = 0; i <= (value - tGrupe.length); i++)
                    tGrupe.push({'naziv' : '', 'brojTakmicara' : -1, 'brojZadataka' : -1});
                
            
                this.setState({
                    grupeZaUrediti : tGrupe
                });
                
                this.prikaziGrupe(0);
            }
        }
        else
            this.setState((previousState) => {
                const takmicenje = previousState.takmicenje
                return { takmicenje: {...takmicenje, [key]: value} }
            });
    }

    onChange_Grupe(value, key, index) {
       var tGrupe = this.state.grupeZaUrediti;
       tGrupe[index][key] = value;
       this.setState({
           grupeZaUrediti : tGrupe
       });

       this.prikaziGrupe(0);
    }

    clanKomisijeUpdate(event) {
        if (event.target.checked)  {
            this.state.listaAdmina.map((admin) => {
                if (admin.id == event.target.value) {
                    this.state.clanoviKomisije.push(admin.id);
                    this.povuciAdmine();
                }
            });
        
        }
        else { 
            if (this.state.takmicenje != null)
                this.state.clanoviKomisije = this.state.clanoviKomisije.filter(clanKomisije => (clanKomisije != event.target.value));
            else
            this.state.clanoviKomisije = this.state.clanoviKomisije.filter(clanKomisije => (clanKomisije.id != event.target.value));
           this.povuciAdmine();
        }

        
    }

    takmicarskaGrupaUpdate(event, atribut, i) {
        switch(atribut) {
            case 'naziv':
                this.state.takmicarskeGrupe[i].naziv = event.target.value;
                break;
            
            case 'takmicari':
                this.state.takmicarskeGrupe[i].brojTakmicara = event.target.value;
                break;
            
            case 'zadaci':
                this.state.takmicarskeGrupe[i].brojZadataka = event.target.value;
                break;
        }
    }

    prikaziDetalje() {
        document.getElementById("mySidenav").style.height = "30%";
    }
        
    closeNav() {
        document.getElementById("mySidenav").style.height = "0";
    }

    povuciAdmine() {
        if(this.state.listaAdmina.length > 0) {
            const _admini = this.state.listaAdmina.map((admin) => (
                <div><input type="checkbox" value={admin.id} id={admin.id} onChange={this.clanKomisijeUpdate.bind(this)} checked={this.state.clanoviKomisije.includes(admin.id) ? true : false}/>{admin.ime + ' ' + admin.prezime}<br/></div>
            ));

           this.setState({
               admini : _admini
           });
        }
        else 
        axios.get('/admini', {
            params : {
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success == 'yes') {
                const _admini = response.data.data.map((admin) => (
                    <div><input type="checkbox" value={admin.id} id={admin.id} onChange={this.clanKomisijeUpdate.bind(this)} checked={this.state.clanoviKomisije.includes(admin.id) ? true : false}/>{admin.ime + ' ' + admin.prezime}<br/></div>
                ));

               this.setState({
                   admini : _admini,
                   listaAdmina : response.data.data
               });
            }
            else {
            }
        })
        .catch(error => {
        })
    }

    povuciTakmicenje(id) {
        axios.get('/takmicenje', {
            params : {
                id : id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                this.setState({
                    takmicenje : response.data.takmicenje,
                    grupeZaUrediti : response.data.takmicarskeGrupe,
                    brojGrupa : response.data.takmicarskeGrupe.length,
                    clanoviKomisije : response.data.admini
                });
                this.prikaziGrupe(0);
                this.povuciAdmine();
            }

            
            else
                alert(response.data.data)
        })
        .catch(err => {
            console.log(err)
        })
    }

    spasiTakmicenje() {
       if(this.validacija()) {
           if (this.state.takmicenje == null) {
                axios.post('/novoTakmicenje', {
                    takmicenje : this.state,
                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token
                })
                .then(response => {
                    if (response.data.success == 'yes') {
                        this.setState({
                            poruka : 'Takmičenje uspješno dodano.'
                        })
                    }
                    else {
                        this.setState({
                            greska : response.data.data
                        })
                    }
                })
                .catch(error => {
                    this.setState({
                        greska : error.toString()
                    })
                });
            }
            else {
                var grupe = [];

                axios.post('/updateTakmicenja', {
                    takmicenje : this.state.takmicenje,
                    grupe : this.state.grupeZaUrediti,
                    admini : this.state.clanoviKomisije,
                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token
                })
                .then(response => {
                    if (response.data.success)
                        this.setState({
                            poruka : 'Izmjene su sačuvane.'
                        });
                    else
                        this.setState({
                            greska : response.data.data
                        });
                })
                .catch(error => {
                    this.setState({
                        greska : error.toString()
                    });
                });
            }
        }
    }

    validacija() {
        var greska = "";
        var takmicenje = this.state.takmicenje != null ? this.state.takmicenje : this.state;
        var takmicarskeGrupe = this.state.grupeZaUrediti != null ? this.state.grupeZaUrediti : this.state.takmicarskeGrupe;
        
        // zbog nekompatibilnosti imena...
        takmicenje.datumPocetka = this.state.takmicenje != null ? this.state.takmicenje.pocetak : this.state.datumPocetka;
        takmicenje.datumZavrsetka = this.state.takmicenje != null ? this.state.takmicenje.kraj : this.state.datumZavrsetka

        if (takmicenje.datumPocetka == null)
            greska += 'Potrebno je unijeti datum početka takmičenja. '
        if (takmicenje.datumZavrsetka == null)
            greska += 'Potrebno je unijeti datum završetka takmičenja. '
        if (takmicenje.datumZavrsetka < this.state.datumPocetka)
            greska += 'Datum završetka mora biti jednak ili veći od datuma početka ';
        if (takmicenje.programskiJezik.length == 0)
            greska += 'Potrebno je unijeti programski jezik u kojem će učesnici rješavati zadatke. '
        if (takmicenje.naziv.length == 0)
            greska += 'Potrebno je unijeti naziv takmičenja. ';
        if (takmicenje.tipDatoteke.length == 0) 
            greska += 'Potrebno je unijeti tip datoteke koja se prihvata kao validno rješenje. '
        else if (takmicenje.tipDatoteke[0] != '.')
            greska += 'Tip datoteke mora počinjati tačkom (.).'

        for (var i = 0; i < takmicarskeGrupe.length; i++) {
            if (takmicarskeGrupe[i].naziv.length == 0)
                greska += "Potrebno je unijeti nazive za sve takmičarske grupe. ";
        }
        
        if (greska.length > 0) {
            this.prikaziDetalje();
            this.setState({
                greskaUnosa : greska
            });
            return false;
        }

        return true;
    }

    
	prikaziGrupe(brojGrupa) {
        var _grupe = [];
        var _takmicarskeGrupe = [];
        if (this.state.takmicenje == null) {
            for (let i = 0; i < brojGrupa; i++) {
                _grupe.push(
                    <div className="loop">
                        <table><tbody>
                            <tr>
                                <td>Naziv grupe:</td>
                                <td><input style={{width : '280px', background: 'transparent', border: '0', borderBottom : '1px solid #66ff66'}} type="text"onChange={(event) => this.takmicarskaGrupaUpdate(event, 'naziv', i)}/></td>
                            </tr>
                            <tr>
                                <td>Broj učesnika (opcionalno):</td>
                                <td><input  type="number" onChange={(event) => this.takmicarskaGrupaUpdate(event, 'takmicari', i)}/></td>
                            </tr>
                            <tr>
                                <td>Broj zadataka (opcionalno): </td>
                                <td><input type="number" onChange={(event) => this.takmicarskaGrupaUpdate(event, 'zadaci', i)}/></td>
                            </tr>
                        </tbody></table>
                    </div>
                );
                
                _takmicarskeGrupe.push({
                    redniBroj : i + 1,
                    naziv : '',
                    brojZadataka : -1,
                    brojTakmicara : -1
                })
            }
        }
        else {
            _grupe = this.state.grupeZaUrediti.map((grupa, i) => (
                <div className="loop">
                    <table><tbody>
                        <tr>
                            <td>Naziv grupe:</td>
                            <td><input style={{width : '280px', background: 'transparent', border: '0', borderBottom : '1px solid #66ff66'}} type="text" value={grupa.naziv} onChange={(event) => this.onChange_Grupe(event.target.value, 'naziv', i)}/></td>
                        </tr>
                        <tr>
                            <td>Broj učesnika (opcionalno):</td>
                            <td><input  type="number"  value={grupa.brojTakmicara < 0 ? "" : grupa.brojTakmicara} onChange={(event) => this.onChange_Grupe(event.target.value, 'brojTakmicara', i)}/></td>
                        </tr>
                        <tr>
                            <td>Broj zadataka (opcionalno): </td>
                            <td><input type="number" value={grupa.brojZadataka < 0 ? "" : grupa.brojZadataka} onChange={(event) => this.onChange_Grupe(event.target.value, 'brojZadataka', i)}/></td>
                        </tr>
                    </tbody></table>
                </div>
            ));
        }

        this.setState({
            takmicarskeGrupe : _takmicarskeGrupe,
            grupe : _grupe
        });

	}

    render() {
        var takmicenje = this.state.takmicenje;
        var inputStyle = {width : '280px', background: 'transparent', border: '0', borderBottom : '1px solid #66ff66'};
        return (
            <div className="NovoTakmicenje">
                {this.state.poruka != null ? 
                    <div className="takmicenje">
                        <p className="uspjeh">{this.state.poruka}</p>
                    </div> : 
                    <div>
                        {this.state.greska != null ?
                        <div>
                            <p className="greska">{this.state.greska}</p>
                        </div> :
                        <div>
                            <div className="takmicenje">
                                <p className="naslov">Informacije o trajanju takmičenja</p>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td><p>Datum početka takmičenja:</p></td>
                                            {takmicenje == null ?
                                            <td><input className={styles.datum} type="date" onChange={this.datumPocetkaUpdate.bind(this)}/></td>
                                            :
                                            <td><input className={styles.datum} type="date" value={this.state.takmicenje.pocetak} onChange={(e) => this.onChange(e.target.value, 'pocetak')}/></td>
                                            }
                                            <td><p>Datum završetka takmičenja:</p></td>
                                            {takmicenje == null ?
                                            <td><input className={styles.datum} type="date" onChange={this.datumZavrsetkaUpdate.bind(this)}/></td> 
                                            :
                                            <td><input className={styles.datum} type="date" value={this.state.takmicenje.kraj} onChange={(e) => this.onChange(e.target.value, 'kraj')}/></td>
                                            }
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {(this.state.takmicenje == null || this.state.takmicenje != null) ?
                            <div className="takmicenje">
                                <p className="naslov">Informacije o osoblju</p>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td><p>Odaberite članove komisije:</p></td>
                                            <td>
                                                <div className="listaOsoblja">
                                                    {this.state.admini}
                                                </div>
                                            </td>
                                            <td><p className="napomena">Napomena: Članovi koje odaberete će automatski dobiti administratorska prava nad takmičenjem.</p></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            : null
                            }
                           
                            <div className="takmicenje">
                                <p className="naslov">Ostale informacije o takmičenju</p>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td><p>Naziv takmičenja:</p></td>
                                            {takmicenje == null ?
                                            <td><input type="text" style={inputStyle} onChange={this.nazivUpdate.bind(this)}/></td>
                                            :
                                            <td><input type="text" style={inputStyle} value={this.state.takmicenje.naziv} onChange={(e) => this.onChange(e.target.value, 'naziv')}/></td>
                                            }
                                            <td><p>Nivo takmičenja:</p></td>
                                            <td>
                                                <select onChange={this.nivoUpdate.bind(this)}>
                                                    <option value="opcinsko">Općinsko takmičenje</option>
                                                    <option value="kantonalno">Kantonalno takmičenje</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><p>Opis takmičenja:</p></td>
                                            {takmicenje == null ? 
                                            <td><textarea className="takmicenje_textarea" onBlur={this.opisUpdate.bind(this)}></textarea></td>
                                            :
                                            <td><textarea className="takmicenje_textarea" value={this.state.takmicenje.opis} onChange={(e) => this.onChange(e.target.value, 'opis')}></textarea></td>
                                            }
                                            <td><p>Broj takmičarskih grupa:</p></td>
                                            {takmicenje == null ?
                                            <td>
                                                <input className="brojGrupa" type="number" min="1" onChange={this.brojGrupaUpdate.bind(this)}/>
                                                <button className="maliButton" onClick={(event) => this.prikaziGrupe(document.getElementsByClassName('brojGrupa')[0].value)}>Potvrdi</button>
                                            </td>
                                            :
                                            <td>
                                                <input className="brojGrupa" type="number" min={this.state.grupeZaUrediti.length} onChange={this.brojGrupaUpdate.bind(this)}/>
                                                <button className="maliButton" onClick={(event) => this.onChange(document.getElementsByClassName('brojGrupa')[0].value, 'brojGrupa')}>Potvrdi</button>
                                            </td>
                                            }
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {this.state.grupe.length > 0 ?
                                <div className="grupe_container">
                                    <div className="NovoTakmicenje">
                                    <div className="takmicarskeGrupe">
                                        <p className="naslov">Takmičarske grupe</p>
                                        <div className="listaGrupa">
                                                {this.state.grupe}
                                        </div>
                                        <div className="buttons">
                                            <button onClick={this.spasiTakmicenje.bind(this)}>Potvrdi</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : 
                            null
                        }
                    </div>
                    }
                </div>
                    }
                    <div className="sidenav_admin" id="mySidenav">
                        <table style={{margin: '3%'}}>
                            <tbody>
                                <tr>
                                    <td>
                                        <div style={{ marginBottom : '0', textAlign : 'left'}}>
                                            <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav.bind(this)}>&times;</a>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <p className="greska">{this.state.greskaUnosa}</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> 
            </div>
        );
    }
}

/*class PregledTakmicenja extends Component {
    constructor(props) {
        super(props);
        this.state = {
            takmicenja : [],
            poruka : null
        }

        this.povuciTakmicenja = this.povuciTakmicenja.bind(this);
    }

    povuciTakmicenja() {
        axios.get("/takmicenja", {})
        .then(response => {
            this.setState({
                takmicenja : response.data.takmicenja
            });
        })
        .catch(error => {
            this.setState({
                poruka : error
            });
        });
    }

    render() {
        const svaTakmicenja = this.state.takmicenja.map((takmicenje) => (
            <div className="svaTakmicenja">
                <table>
                    <tbody>
                        <tr>
                            <td><p>{takmicenje.ID}</p></td>
                            <td><p>{takmicenje.naziv}</p></td>
                            <td><p>{takmicenje.aktivno}</p></td>
                            <td><button>PREGLED</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )); 

        return (
            <div>
                <p className="naslov">Registrovana takmičenja</p>
                
            </div>
        )
    }


}*/


export default Takmicenje;