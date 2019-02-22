import React, { Component } from 'react';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import io from 'socket.io-client';
import Sesija from '../Sesija.js';

import DetaljiRjesenja from '../Ucesnik/DetaljiRjesenja.js';

const axios = require('axios');
var tumac = require('../Tumac.js');


class LiveTakmicenje extends Component {
    constructor(props) {
        super(props);

        this.state = {
            grupe : this.props.grupe,
            zadaci : null,
            odabraniZadatak : null
        }

        this.socket = io('localhost:5000');
        this.socket.on('NOVA_VERZIJA', (data) => {
           this.novaVerzija(data);
        });
    }

    componentWillMount() {
        this.povuciZadatke(this.props.grupe[0].id);
    }

    takmGrupaUpdate(event) {
        var odabranaGrupa = null;
        this.props.grupe.map((grupa) => {
            if (grupa.id == event.target.value)
                odabranaGrupa = grupa;
        });

        this.setState({
            prikazi : false,
            trenutnaGrupa : odabranaGrupa
        })
        this.povuciZadatke(event.target.value);
    }

    zadaciUpdate(event) {
        this.setState({
            odabraniZadatak : event.target.value
        })
    }

    novaVerzija = function(data) {
        var verzija = data.verzija;
        var zadatakId = verzija.zadatakId;
        var zadaci = this.state.zadaci;
        let j = 0;
        for (j = 0; j < zadaci.length; j++) {
            if (zadaci[j].id == verzija.zadatakId) {
                zadaci[j].rezultati.push(verzija);
                break;
            }
        }
        if (j == zadaci.length) {
            var rezultati = [];
            rezultati.push(verzija);
            var verzija = {
                'id' : verzija.zadatakId,
                'rezultati' : rezultati
            }
            zadaci.push(verzija);
        }

        this.setState({
            zadaci : zadaci
        });
    }


    povuciZadatke(takmGrupaId) {
        axios.get('/verzijeOsoblje', {
            params : {
                id : takmGrupaId,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => { 
            if (response.data.success) {
                var zadaci = response.data.data;
                for (var i = 0; i < zadaci.length; i++) {
                    var zadatak = zadaci[i];
                    console.log(zadatak)
                    for (var j = 0; j < zadatak.rezultati.length; j++) {
                        var verzija = zadatak.rezultati[j];
                        for (var k = 0; k < verzija.autotest_rezultati.length; k++) {
                            var at = verzija.autotest_rezultati[k];
                            var autotest = {
                                'status' : at.status,
                                'output' : at.output,
                                'runResult' : at.runResult,
                                'compileResult' : at.compileResult,
                                'ulaz' : at.ulaz,
                                'ocekivaniIzlaz' : at.izlaz
                            };
                            zadaci[i].rezultati[j].autotest_rezultati[k] = autotest;
                        }
                    }
                }
                this.setState({
                    zadaci : zadaci,
                    odabraniZadatak : 0
                });   
            }
            else {

            }
        })
        .catch(error => {
            alert(error.toString());
        });
    }

    prikaziDetalje(e) {
        document.getElementById("mySidenav").style.width = "60%";
    }
        
    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    render() {
        var grupe = this.props.grupe.map((grupa) => (
            <option value={grupa.id}>{grupa.naziv}</option>
        ));
        var zadaci = [];
        if (this.state.zadaci) {
            zadaci = this.state.zadaci.map((zadatak, i) => (
                <option value={i}>Zadatak {i + 1}.</option>
            ))
        }

        var verzije = [];
        if (this.state.odabraniZadatak != null) {
            verzije = this.state.zadaci[this.state.odabraniZadatak].rezultati.map((verzija, i) => (
            <tr id="cel">
                <td>{(i + 1).toString()}</td>
                <td>{verzija.korisnickoIme}</td>
                <td>{verzija.vrijeme}</td>
                <td>
                    <Link to={`/detalji/rjesenje/${verzija.vrijeme}/${verzija.id}`}>
                         <a href="#" onClick={this.prikaziDetalje.bind(this)}>Rjesenje br. {i + 1}</a>
                     </Link>
                 </td>
                 <td>{verzija.status}</td>
                 <td>
                     <Link to={`/detalji/autotestovi/${verzija.vrijeme}/${verzija.id}/${verzija.zadatakId}/${verzija.ucesnikId}`}>
                         <a href="#" onClick={this.prikaziDetalje.bind(this)}>Rezultati testiranja</a>
                     </Link>
                 </td>
             </tr>
            ));
        }

        return(
            <Router>
                <div>
                    <div>
                        <p className="naslov">Takmičarska grupa</p>
                        <select className="takmGrupa" onChange={this.takmGrupaUpdate.bind(this)}>{grupe}</select>
                    </div>
                    <div className="nivo_2">
                        <p className="naslov">Zadaci</p>
                        <select className="takmGrupa" onChange={this.zadaciUpdate.bind(this)}>{zadaci}</select>
                    </div>
                    <div style={{margin: '4%'}}> 
                        {this.state.odabraniZadatak != null ?
                        <div>
                            <div>
                                <table>
                                    <tbody>
                                        <tr id="cel">
                                            <th>Red. broj</th>
                                            <th>Učesnik</th>
                                            <th>Vrijeme predaje</th>
                                            <th>Rješenje</th>
                                            <th>Status</th>
                                            <th>Rezultati testiranja</th>
                                        </tr>
                                        {verzije}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sidenav" id="mySidenav">
                                <div style={{ margin: '3%', marginBottom : '0', textAlign : 'left'}}>
                                    <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav.bind(this)}>&times;</a>
                                </div>
                                <Route exact path="/detalji/autotestovi/:vrijeme/:id/:zId/:uId" component={DetaljiRjesenja}></Route>
                                <Route exact path="/detalji/rjesenje/:vrijeme/:id" component={DetaljiRjesenja}></Route>
                            </div>
                        </div> :
                        null}
                    </div>
                </div>
            </Router>
        );
    }
}


export default LiveTakmicenje;