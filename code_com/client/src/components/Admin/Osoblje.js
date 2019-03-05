// osoblje za administratora

import React, { Component } from 'react';
import '../../css/AdminPage.css';

import Sesija from '../Sesija.js';

const axios = require('axios');

class Osoblje extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            ime : '',
            prezime : '',
            grad : '',
            titula : '',
            korisnickoIme : '',
            lozinka : '',
            odabranaTakmicenja : [],

            takmicenja :[],
            listaTakmicenja : [],
            poruka : null,
            uspjeh_greska : 'uspjeh',
            greskaUnosa : ''
        }

        this.povuciAktivnaTakmicenja = this.povuciAktivnaTakmicenja.bind(this);
    }

    componentWillMount() {
        this.povuciAktivnaTakmicenja();
    }
  


    imeUpdate(event) {
        this.setState({ ime : event.target.value });
    }

    prezimeUpdate(event) {
        this.setState({ prezime : event.target.value });
    }

    gradUpdate(event) {
        this.setState({ grad : event.target.value });
    }

    titulaUpdate(event) {
        this.setState({ titula : event.target.value });
    }

    odabranaTakmicenjaUpdate(event) {
        if (event.target.checked)
            this.state.listaTakmicenja.map((takmicenje) => {
            if (takmicenje.id == event.target.value)
                this.state.odabranaTakmicenja.push(takmicenje);
            });
       
        else { 
            var takmicenja = this.state.odabranaTakmicenja.filter(odabranoTakmicenje => odabranoTakmicenje.id != event.target.value);
            this.setState({
                odabranaTakmicenja : takmicenja
             });
        }
    }

    povuciAktivnaTakmicenja() {
        axios.get('/takmicenja', {
            params : {
                filter : 'aktivna',
                
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                const _takmicenja = response.data.data.map((takmicenje) => (
                    <div><input type="checkbox" value={takmicenje.id} onChange={this.odabranaTakmicenjaUpdate.bind(this)}/>{takmicenje.naziv + ' (' + takmicenje.pocetak + ' - ' + takmicenje.kraj + ')'}<br/></div>
                ));

                this.setState({
                    takmicenja : _takmicenja,
                    listaTakmicenja : response.data.data,
                    poruka : null
                });
            }
            else {
                // response.data.data
            }
        })
    }

    getKorIme(ime) {
       ime = ime.replace('ž', 'z');
       ime = ime.replace('š', 's');
       ime = ime.replace('đ', 'd');
       ime = ime.replace('č', 'c');
       ime = ime.replace('ć', 'c');
       return ime;
    }

    dodajAdmina() {
        if (this.validacija()) {
            var korIme =  this.getKorIme(this.state.ime.toLowerCase()[0])  + this.getKorIme(this.state.prezime.toLowerCase());
            var loz = Math.random().toString(36).slice(2) + 1
            this.setState({
                korisnickoIme : korIme,
                lozinka : loz
            });
            axios.post('/noviAdmin', {
                _korisnickoIme : korIme,
                lozinka : loz,
                ime : this.state.ime,
                prezime : this.state.prezime,
                grad : this.state.grad,
                titula : this.state.titula,
                odabranaTakmicenja : this.state.odabranaTakmicenja,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            })
            .then(response => {
                if (response.data.success){ 
                    this.setState({
                        poruka : 
                           "Administrator takmičenja uspješno dodan. Pristupne podatke možete dobiti klikom na 'Pregled registrovanog osoblja'.",
                        uspjeh_greska : 'uspjeh'
                    });
                }
                else
                    this.setState({
                        poruka : response.data.data,
                        uspjeh_greska : 'greska'
                    });
                this.setState(this.state);
            })
            .catch(error => {
                    this.setState({
                        poruka : error,
                        uspjeh_greska : 'greska'
                    });
                    this.setState(this.state);
            });
    }
        
    }

    validacija() {
        var greska = '';
        if (this.state.ime.length == 0)
            greska += 'Potrebno je unijeti ime administratora. ';
        if (this.state.prezime.length == 0)
            greska += 'Potrebno je unijeti prezime administratora. ';
        if (this.state.grad.length == 0)
            greska += 'Potrebno je unijeti grad administratora. ';

        if (greska.length > 0) {
            this.prikaziDetalje();
            this.setState({
                greskaUnosa : greska
            });

            return false;
        }

        return true;
    }

    prikaziDetalje() {
        document.getElementById("mySidenav").style.height = "30%";
    }
        
    closeNav() {
        document.getElementById("mySidenav").style.height = "0";
    }

    render() {
        var p_style = {width : '50px'},
            i_style = {width : '280px', border : '0', borderBottom : '1px solid #66ff66', background : 'transparent'};
        
        return (
            <div className="NoviAdmin">
            
                <div>
                <div className="takmicenje">
                    <p className="naslov">Lični podaci</p>
                    <table>
                        <tbody>
                            <tr>
                                <td><p style={p_style}>Ime:</p></td>
                                <td><input style={i_style} type="text" onChange={this.imeUpdate.bind(this)}/></td>
                                <td><p style={p_style}>Prezime:</p></td>
                                <td><input style={i_style} type="text" onChange={this.prezimeUpdate.bind(this)}/></td>
                            </tr>
                            <tr> 
                                <td><p style={p_style}>Grad:</p></td>
                                <td><input style={i_style} type="text" onChange={this.gradUpdate.bind(this)}/></td>
                                <td><p style={p_style}>Titula:</p></td>
                                <td><input style={i_style} type="text" onChange={this.titulaUpdate.bind(this)}/></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="takmicenje">
                    <p className="naslov">Informacije o takmičenjima</p>
                    <table>
                        <tbody>
                            <tr>
                                <td><p>Odabrana takmičenja:</p></td>
                                <td>
                                    <div className="listaOsoblja">
                                       {this.state.takmicenja}
                                    </div>
                                </td>
                                <td><p className="napomena">Napomena: Administrator će imati sva prava nad odabranim takmičenjima (definisanje zadataka, autotestova, pregled rješenja itd.)</p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="buttons">
                    <button onClick={this.dodajAdmina.bind(this)}>Potvrdi</button>
                </div>
                {this.state.poruka != null ? <p className={this.state.uspjeh_greska} >{this.state.poruka}</p> : null}
                <div className="logo">
                    <h2>code.com</h2>
                </div> 
            </div>
            
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
        )
    }
}

export default Osoblje;