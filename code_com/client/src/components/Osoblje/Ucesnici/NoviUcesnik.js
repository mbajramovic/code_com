import React, { Component } from 'react';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import Sesija from '../../Sesija.js';


import noviUcesnik_logo from '../../../images/noviUcesnik.png';
import ucesnik_logo from '../../../images/ucesnik.png';

const axios = require('axios');

// dodavanje novog ucesnika
class NoviUcesnik extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ime : '',
            prezime : '',
            maticniBroj : '',
            skola : '',
            grad : '',
            opcina : '',
            kanton : '',
            drzava : '',
            korisnickoIme : '',
            lozinka : '',

            poruka : null,
            greska : null,

            pristupniPodaci : null,

            ucesnikId : -1,
            lokacija : null,
            ucesnik : null
        };

        if (this.props.match) {
            this.setState({   
                ucesnikId : this.props.match.params.ucesnikId
            });

            this.povuciUcesnika(this.props.match.params.ucesnikId);
        }
            

        this.generisiKorisnickePodatke = this.generisiKorisnickePodatke.bind(this);
    }

    componentDidMount() {
        this.generisiKorisnickePodatke();
    }

    imeUpdate(event) {
        this.setState({ime : event.target.value});
    }

    prezimeUpdate(event) {
        this.setState({prezime : event.target.value});
    }

    maticniBrojUpdate(event) {
        this.setState({maticniBroj : event.target.value});
    }

    skolaUpdate(event) {
        this.setState({skola : event.target.value});
    }

    gradUpdate(event) {
        this.setState({grad : event.target.value});
    }

    opcinaUpdate(event) {
        this.setState({opcina : event.target.value});
    }

    kantonUpdate(event) {
        this.setState({kanton : event.target.value});
    }

    drzavaUpdate(event) {
        this.setState({drzava : event.target.value});
    }

    onChange(value, key, tmp) {
        if (tmp == '1')
            this.setState((previousState) => {
                const ucesnik = previousState.ucesnik
                return { ucesnik: {...ucesnik, [key]: value} }
            });
        else
            this.setState((previousState) => {
                const lokacija = previousState.lokacija
                return { lokacija: {...lokacija, [key]: value} }
            });
    }

    generisiKorisnickePodatke() {
        this.setState({
            korisnickoIme : 'ucesnik' + this.props.brojUcesnika + 1,
            lozinka : Math.random().toString(36).slice(2) + this.props.brojUcesnika + 1
        });
    }

    dodajUcesnika() {
        if (this.state.ucesnik == null) {
            this.generisiKorisnickePodatke();
            axios.post('/noviUcesnik', {
                ucesnik : this.state,
                takmicarskaGrupaId : this.props.takmGrupaId,
                
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            })
            .then(response => {
                if (response.data.success) {
                    this.setState({
                        poruka : 'Uspješno dodan novi učesnik.',
                        pristupniPodaci : <table><tbody><tr><td>Korisničko ime:</td><td>{this.state.korisnickoIme}</td></tr><tr><td>Lozinka:</td><td>{this.state.lozinka}</td></tr></tbody></table>
                    });
                }
                else {
                    this.setState({
                        greska : response.data.data.toString()
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
            axios.post('/updateUcesnika', {
                ucesnik : this.state.ucesnik,
                lokacija : this.state.lokacija,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            })
            .then(response => {
                if (response.data.success) {
                    this.setState({
                        poruka : 'Izmjene uspješno sačuvane.'
                    });
                }
                else {
                    this.setState({
                        greska : response.data.data.toString()
                    });
                }
            })
            .catch(error => {
                this.setState({
                    greska : error.toString()
                });
            });
        }
    }

    povuciUcesnika(id) {
        axios.get('/ucesnik', {
            params : {
                id : id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                this.setState({
                    ucesnik : response.data.ucesnik,
                    lokacija : response.data.lokacija,

                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token
                });
            }
        })
        .catch(error => {

        });
    }

    render() {
        const style={border : '0', borderBottom : '1px solid #009973'};
        return(
            <div>
                {this.state.poruka != null ?
                    <div>
                        <p className="uspjeh">{this.state.poruka}</p>
                        <p className="naslov">Pristupni podaci</p>
                        {this.state.pristupniPodaci}
                    </div> :
                    <div>
                        {this.state.greska != null ?
                        <div>
                            <p className="greska">{this.state.greska}</p>
                        </div> : 
                        <div className="nivo_1">
                            <p className="naslov">Novi učesnik</p>
                            <div className="nivo_2"> 
                                <p className="naslov">Lični podaci</p>
                                <table className="nZadatak">
                                    <tbody>
                                        <tr>
                                            <td><p>Ime:</p></td>
                                            {this.state.ucesnik == null ?
                                                <td><input type="text" onChange={this.imeUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.ucesnik.ime} onChange={(e) => this.onChange(e.target.value, 'ime', '1')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td><p>Prezime:</p></td>
                                            {this.state.ucesnik == null ?
                                                <td><input type="text" onChange={this.prezimeUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.ucesnik.prezime} onChange={(e) => this.onChange(e.target.value, 'prezime', '1')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td><p>Matični broj:</p></td>
                                            {this.state.ucesnik == null ?
                                                <td><input type="text" onChange={this.maticniBrojUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.ucesnik.maticniBroj} onChange={(e) => this.onChange(e.target.value, 'maticniBroj', '1')} style={style}/></td>
                                            }
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="nivo_2">
                                <p className="naslov">Podaci o lokaciji učesnika</p>
                                <table className="nZadatak">
                                    <tbody>
                                        <tr>
                                            <td><p>Škola:</p></td>
                                            {this.state.lokacija == null ?
                                                <td><input type="text" onChange={this.skolaUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.lokacija.skola} onChange={(e) => this.onChange(e.target.value, 'skola', '2')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td><p>Grad:</p></td>
                                            {this.state.lokacija == null ?
                                                <td><input type="text" onChange={this.gradUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.lokacija.grad} onChange={(e) => this.onChange(e.target.value, 'grad', '2')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td><p>Općina:</p></td>
                                            {this.state.lokacija == null ?
                                                <td><input type="text" onChange={this.opcinaUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.lokacija.opcina} onChange={(e) => this.onChange(e.target.value, 'opcina', '2')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td><p>Kanton:</p></td>
                                            {this.state.lokacija == null ?
                                                <td><input type="text" onChange={this.kantonUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.lokacija.kanton} onChange={(e) => this.onChange(e.target.value, 'kanton', '2')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td><p>Država:</p></td>
                                            {this.state.lokacija == null ?
                                                <td><input type="text" onChange={this.drzavaUpdate.bind(this)} style={style}/></td>
                                            :
                                                <td><input type="text" value={this.state.lokacija.drzava} onChange={(e) => this.onChange(e.target.value, 'drzava', '2')} style={style}/></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <div className="buttons">
                                                <button onClick={this.dodajUcesnika.bind(this)}>Potvrdi</button>
                                            </div>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            </div>}
                        </div>}
                </div>
        )
    }
}

export default NoviUcesnik;