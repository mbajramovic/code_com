import React, { Component } from 'react';

import Sesija from '../../Sesija.js';
const axios = require('axios');

// novi zadatak / uredi stari zadatak
class NoviZadatak extends Component {
    constructor(props) {
        super(props);
        var zadatak = this.props.zadatak;
        this.state = {
            redniBroj : this.props.brojDefinisanihZad != null ? this.props.brojDefinisanihZad + 1 : -1,
            naslov : zadatak == null ? '' : zadatak.naslov,
            tekst :  zadatak == null ? '' : zadatak.tekst,
            ulaz : zadatak == null ? '' : zadatak.ulaz,
            izlaz : zadatak == null ? '' : zadatak.izlaz,
            oblast : zadatak == null ? '' : zadatak.oblast,
            bodovi : zadatak == null ? '' : zadatak.bodovi,
            editable : false,
            adminId : this.props.adminId,
            odabranaGrupa : this.props.odabranaGrupa,

            poruka : null,
            greska : null
        }
    }

    naslovUpdate(event) {
        this.setState({naslov : event.target.value});
    }

    tekstUpdate(event) {
        this.setState({tekst : event.target.value});
    }

    ulazUpdate(event) {
        this.setState({ulaz : event.target.value});
    }

    izlazUpdate(event) {
        this.setState({izlaz : event.target.value});
    }

    oblastUpdate(event) {
        this.setState({oblast : event.target.value});
    }

    editableUpdate(event) {
        this.setState({editable : event.target.checked});
    }

    bodoviUpdate(event) {
        this.setState({bodovi : event.target.value});
    }

    dodajZadatak() {
        if (this.props.zadatak == null) {// novi zadatak
            axios.post('/noviZadatak', {
                zadatak : this.state,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            })
            .then(response => {
                if (response.data.success) {
                    this.setState({
                        poruka : 'Uspješno dodan novi zadatak.'
                    })
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
        else { //uredjivanje
            axios.post('/urediZadatak', {
                zadatakId : this.props.zadatak.id,
                zadatak : this.state,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            })
            .then(response => {
                if (response.data.success)
                    this.setState({
                        poruka : 'Izmjene sačuvane.'
                    });
                else {
                    this.setState({
                        greska : response.data.data
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

    render() {
        var zadatakZaUr = this.props.zadatak;
        if (zadatakZaUr == null) {
            zadatakZaUr = {
                tekst : '',
                naslov : '',
                ulaz : '',
                izlaz : '',
                oblast : '',
                dozvoliIzmjene : false,
                bodovi : 0
            };
        } else {
            this.state.redniBroj = zadatakZaUr.redniBroj;
            //alert(this.props.autorID + ' ' + this.props.adminID);
        }
        return (
            <div>
                {this.state.odabranaGrupa == null || !(this.state.odabranaGrupa.brojZadataka != -1 && this.props.brojDefinisanihZad == this.state.odabranaGrupa.brojZadataka) ?
                <div>
                    {this.state.poruka != null ? 
                        <div className="nivo_3">
                            <p className="uspjeh">{this.state.poruka}</p>
                        </div> : 
                        <div>
                            {this.state.greska != null ?
                            <div className="nivo_3">
                                <p className="greska">{this.state.greska}</p>
                            </div> :
                        <div className="nivo_3">
                            <p className="naslov">Novi zadatak</p>
                            <table className="nZadatak">
                                <tbody>
                                    <tr>
                                        <td><p>Redni broj:</p></td>
                                        <td><p>{this.state.redniBroj}</p></td>
                                    </tr>
                                    {this.props.zadatak != null ?
                                    <tr>
                                        <td><p>Naslov:</p></td>
                                        <td><input type="text" onChange={this.naslovUpdate.bind(this)}value={zadatakZaUr.naslov}></input></td>
                                    </tr>
                                    :
                                    <tr>
                                         <td><p>Naslov:</p></td>
                                        <td><input type="text" onChange={this.naslovUpdate.bind(this)}></input></td>
                                    </tr>
                                    }
                                    <tr>
                                        <td><p>Tekst:</p></td>
                                        <td><textarea className="osoblje_textarea" onChange={this.tekstUpdate.bind(this)}>{zadatakZaUr.tekst}</textarea></td>
                                    </tr>
                                    <tr>
                                        <td><p>Primjer ulaza:</p></td>
                                        <td><textarea className="maliText" onChange={this.ulazUpdate.bind(this)}>{zadatakZaUr.ulaz}</textarea></td>
                                    </tr>
                                    <tr>
                                        <td><p>Očekivani izlaz:</p></td>
                                        <td><textarea className="maliText" onChange={this.izlazUpdate.bind(this)}>{zadatakZaUr.izlaz}</textarea></td>
                                    </tr>
                                    <tr>
                                        <td><p>Oblast:</p></td>
                                        <td><textarea className="maliText" onChange={this.oblastUpdate.bind(this)}>{zadatakZaUr.oblast}</textarea></td>
                                    </tr>
                                    <tr>
                                        <td><p>Broj bodova:</p></td>
                                        <td><input type="number" onChange={this.bodoviUpdate.bind(this)} ></input></td>
                                    </tr>
                                    {this.props.autorID == null ?// && this.props.autorID == this.props.adminID ? // samo autor moze ovo urediti
                                    <tr>
                                        <td></td>
                                        <td><input className="check" type="checkbox" onChange={this.editableUpdate.bind(this)}/>Drugi admini mogu uređivati zadatak.</td>
                                    </tr> : this.props.autorID == this.props.adminId ?
                                    <tr>
                                        <td></td>
                                        <td><input className="check" type="checkbox" onChange={this.editableUpdate.bind(this)} value={zadatakZaUr.dozvoliIzmjene}/>Drugi admini mogu uređivati zadatak.</td>
                                    </tr> : null}
                                    <tr>
                                    </tr>
                                        <td></td>
                                        <td>
                                            <div className="buttons">
                                                <button onClick={this.dodajZadatak.bind(this)}>POTVRDI</button>
                                                <button>PONIŠTI</button>
                                            </div>
                                        </td>
                                </tbody>
                            </table>
                        </div> }
                    </div> }
                </div> : 
                <div className="nivo_3">
                    <h3 className="greska">Greška: Takmičarska grupa već ima definisane sve zadatke.</h3>
                </div> 
                }
            </div>
        )
    }
}

export default NoviZadatak;