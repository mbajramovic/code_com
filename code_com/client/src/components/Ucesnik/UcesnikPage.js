// stranica za ucesnike takmicenja

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../../css/UcesnikPage.css';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import io from 'socket.io-client';
import Sesija from '../Sesija.js';

import PregledZadatka from './PregledZadatka.js';
import Pitanja from './Pitanja.js';
import Sat from '../Sat.js';

const axios = require('axios');
const server = require('../../serverinfo.json').server;

class UcesnikPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id : this.props.ucesnikId,
            ucesnik : null,
            takmicarskaGrupa : null,
            takmicenje : null,
            zadaci : null,
            error : null,
            sekunde : null,
            kraj : false,

            upute : [],
            indeks : 0
        }

        this.povuciInformacije = this.povuciInformacije.bind(this);
        this.povuciZadatke = this.povuciZadatke.bind(this);

        this.socket = io(server.ip + ':' + server.port);
        this.socket.on('KRAJ_TAKMICENJA', (data) => {
            this.setState({
                kraj : true
            });
         });
    }

    componentWillMount() {
        this.povuciInformacije();
       
    }

    povuciInformacije() {
        axios.get('/informacijeOTakmicenju', {
            params : {
                id : this.state.id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => { 
            if(response.data.success) {
                let sekunde = (new Date(response.data.takmicenje.trajanje) - new Date())/1000;
                this.setState({
                    ucesnik : response.data.ucesnik,
                    takmicarskaGrupa : response.data.takmicarskaGrupa,
                    takmicenje : response.data.takmicenje,
                    sekunde : sekunde,
                    kraj : sekunde > 0 ? false : true
                });
                this.povuciZadatke();
                this.upute();
                this.prikaziUpute(null);
            }
            else 
                this.setState({
                    error : response.data.data
                });
        })
        .catch(error => {
            this.setState({ error : error.message});
        })
    }

    povuciZadatke() {
        axios.get('/zadaci', {
            params : {
                takmicarskeGrupeId : this.state.takmicarskaGrupa.id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success)
                this.setState({zadaci : response.data.data});
            else
                this.setState({error : response.data.data});
        })
        .catch(error => {
            this.setState({error : error.message});
        })
    }

    upute() {
        var upute = [];
        upute.push(
            {
                'tekst' :<p className="napomena">Dobrodošli na {this.state.takmicenje != null ? this.state.takmicenje.naziv : ''}.<br/> Za pregled teksta zadatka ili predaju novog rješenja odaberite željeni zadatak. <br/> Ukoliko imate pitanja odaberite stavku 'Pitanja' iz ponuđenog menija (na lijevoj strani).</p>,
                'prikazano' : false
            }
        );
        upute.push(
            {
                'tekst' : <p className="napomena">Za pregled teksta zadatka odaberite opciju 'Postavka'. Za predaju novog rješenja odaberite opciju 'Novo rješenje', te izaberite datoteku sa odgovarajućom ekstenzijom.</p>,
                'prikazano' : false
            }
        );
        upute.push(
            {
                'tekst': <p className="napomena">U naznačeno polje unesite tekst pitanja te ga postavite klikom na dugme 'Pošalji pitanje'. Na stranici su prikazana ranije postavljena pitanja sa odgovorima kao i pitanja postavljena od strane drugih učesnika a za koja je naznačeno da ih vide svi učesnici takmičenja. </p>,
                'prikazano' : false
            }
        );
        this.setState({
            upute : upute
        })
    }

    logout() {
        this.props.onLogout();
    }

    prikaziUpute(e) {
        document.getElementById("mySidenav").style.height = "25%";
        document.getElementById("mySidenav").style.width = "100%";        
    }
        
    closeNav() {
        document.getElementById("mySidenav").style.width = "0";        
        document.getElementById("mySidenav").style.height = "0";

    }

    updateIndeks(e) {
        console.log(this.state.upute);
        var indeks = 2;
        if (e.target.value == "1")
            indeks = 1;
        console.log(indeks);
        if (!this.state.upute[indeks].prikazano) {
            var upute = this.state.upute;
            upute[indeks].prikazano = true;
            this.setState({
                indeks : indeks,
                upute : upute
            });

            this.prikaziUpute();
        }
    }
    
    render() {
        var zadaci = null;
        if (this.state.zadaci != null) {
           zadaci = this.state.zadaci.map((zadatak) => (
               <li style={{marginLeft : '2%'}}>
                   <Link to={`/ucesnik/zadatak/${ zadatak.id }/${zadatak.redniBroj}/${this.state.id}/${this.state.takmicenje.id}`}>
                        <button className="menuButton" value="1" onClick={this.updateIndeks.bind(this)}> Zadatak {zadatak.redniBroj}</button>
                    </Link>
               </li>
           ));
        }

        const style = {borderRight : '1px solid #009973', marginRight : '5%'};

        return(
            <Router>
                <div className="UcesnikPage">
                    {this.state.ucesnik != null && this.state.error == null ? 
                    <div className="grid-container">
                        <div className="prviRed">
                            <table><tbody>
                                <tr>
                                    <td style={style}>Dobrodošli! 
                                        <a href="#" style={{color : '#009973'}} onClick={this.prikaziUpute.bind(this)}> Upute</a>
                                    </td>
                                   
                                </tr>
                            </tbody></table>
                        </div>
                        <div className="drugiRed">
                            <div className="menu" style={{height : '80vh'}}>
                                <div>
                                    <ul>
                                        <li><h2>code.com</h2></li>
                                        <li style={{borderBottom : '1px solid #009973', color : 'white'}}>
                                            Lista zadataka
                                        </li>
                                        {zadaci}
                                        <li style={{borderBottom : '1px solid #009973', color : 'white', marginTop : '3%'}}>
                                            Postavljena pitanja i odgovori
                                        </li>
                                        <li> 
                                            <Link to={`/ucesnik/${this.state.id}/${this.state.takmicenje.id}/pitanja`}>
                                                <button className="menuButton" onClick={this.updateIndeks.bind(this)}>Pitanja</button>
                                            </Link>
                                        </li>
                                        <li style={{borderBottom : '1px solid #009973', color : 'white', marginTop : '3%'}}>
                                            Vrijeme
                                        </li>
                                        <li style={{color : '#999999'}}>
                                            <Sat sekunde={this.state.sekunde} takmicenjeId={this.state.takmicenje.id} ucesnik={1}/>
                                        </li>
                                        <li  style={{borderBottom : '1px solid #009973', color : 'white', marginTop : '6%'}}>
                                            Odjava sa sistema
                                        </li>
                                        <li>
                                            <button className="menuButton" onClick={this.logout.bind(this)}>Odjavi se</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            {!this.state.kraj ?
                                <div className="container" style={{height : '80vh'}}>
                                    <Route exact path='/ucesnik/zadatak/:id/:redniBroj/:ucesnikId/:takmicenjeId' component={PregledZadatka}></Route>
                                    <Route exact path='/ucesnik/:ucesnikId/:takmicenjeId/pitanja' component={Pitanja}></Route>
                                </div>
                            :
                                <div className="container" style={{height : '80vh'}}>
                                    <p className="uspjeh">Takmičenje je završeno.</p>
                                </div>
                            }
                        </div>
                    </div>
                    : this.state.error != null ? 
                    <div>
                        <p className="greska">{this.state.error}</p>
                        <button style={{background : 'white', height : '50px', color : '#009973', borderColor : '#009973', borderRadius : '12px'}} onClick={this.logout.bind(this)}>Odjava sa sistema</button>
                    </div> : 
                    <div>
                        <p className="greska">Učesnik nije prijavljen ni na jedno aktivno takmičenje.</p> 
                    </div>
                    }
                    <div className="sidenav_admin" id="mySidenav">
                        <table style={{margin: '2%'}}>
                            <tbody>
                                <tr>
                                    <td>
                                        <div style={{ marginBottom : '0', textAlign : 'left'}}>
                                            <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav.bind(this)}>&times;</a>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            {this.state.upute.length > 0 ?
                                            <div>
                                                {this.state.upute[this.state.indeks].tekst}
                                            </div>
                                            : null
                                            }
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> 
                   
                </div>
            </Router>
        );
    }
}

export default UcesnikPage;