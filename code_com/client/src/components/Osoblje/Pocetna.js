// pocetna stranica za osoblje (administratore takmičenja)

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from '../../registerServiceWorker';

import '../../css/OsobljePage.css';
import '../../css/common.css'

import DetaljiTakmicenja from './DetaljiTakmicenja.js';
import Sesija from '../Sesija.js';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import io from 'socket.io-client';


const axios = require('axios');

class Pocetna extends Component {
    constructor(props) {
        super(props);

        this.state = {
            aktivnaTakmicenja : [],
            id : this.props.idAdmina,
            prikazi : false
        };
        
        localStorage.setItem('adminId', this.state.id);

        this.socket = io('localhost:5000');
        this.socket.on('NOVA_VERZIJA', (data) => {
           this.novaVerzija(data);
        });

        this.povuciAktivnaTakmicenja = this.povuciAktivnaTakmicenja.bind(this);
    }

    componentDidMount() {
        this.povuciAktivnaTakmicenja();
    }

    povuciAktivnaTakmicenja() {
        axios.get('/takmicenja', {
            params : {
                id : this.state.id,
                filter : 'aktivna',
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
                
            }
        })
        .then(response => {
            if (response.data.success) { 
                var takmicenja = response.data.data;
                for (let i = 0; i < takmicenja.length; i++) {
                    takmicenja[i].brojNovihVerzija = 0;
                }
                this.setState({
                 
                    aktivnaTakmicenja : takmicenja
                });
            }
        })
        .catch(error => {

        });
    }

    prikaziTakmicenje(e) {
        localStorage.setItem('takmicenjeId', e.target.value);
        this.setState({
            prikazi : true
        });
    }

    novaVerzija(data) {
        var takmicenja = this.state.aktivnaTakmicenja;
        for (let i = 0; i < takmicenja.length; i++)
            if (takmicenja[i].id == data.verzija.takmicenjaId) {
                takmicenja[i].brojNovihVerzija++;
                break;
            }
        this.setState({
            aktivnaTakmicenja : takmicenja
        })
    }

    fun() {
        alert('hi');
    }

    render() {
        
        const detaljiTakmicenja = () => <DetaljiTakmicenja id={localStorage.getItem('takmicenjeId')} idAdmina={localStorage.getItem('adminId')}/>;
        // detalji ili lista...
        var prikaz = this.state.prikazi;
        if (this.state.aktivnaTakmicenja.length > 0) 
            this.state.prikazi = !prikaz;

        const aktivnaTakmicenja = this.state.aktivnaTakmicenja.map((takmicenje) => (
                <div className="aktivnaTakmicenja">
                    <table><tbody>
                        
                    <tr><td>Takmičenje: {takmicenje.naziv}</td>
                    </tr>
                    <tr>
                        {takmicenje.aktivno ? 
                            <td className="napomena">
                                Takmičenje se trenutno održava. Klikom na PREGLED možete pratiti trenutno stanje na takmičenju.
                            </td> 
                        :
                        <td className="napomena">
                            Takmičenje još nije otvoreno. Za otvaranje takmičenja, potrebno je da kliknete na PREGLED i zatim odaberete opciju za otvaranje takmičenja.
                        </td> 
                        }
                        <td>    
                            <Link to={{
                                pathname: '/admin_takmicenja/pocetna/detalji'
                              
                            }}/*{`/admin_takmicenja/detalji/${ this.state.id }/${ takmicenje.id }`}*/>
                                <button value={takmicenje.id} onClick={this.prikaziTakmicenje.bind(this)}>PREGLED</button>
                            </Link>
                        </td>
                    </tr>
                    </tbody></table>
                </div>
        ));
        return (
            <div>
                {this.state.aktivnaTakmicenja.length > 0 ? 
                <div>
                    <Router>
                        <div className="App"> 
                            {!prikaz ? // prikazi listu takmicenja
                                <div> 
                                    <p className="naslov">Aktivna takmičenja</p> 
                                    {aktivnaTakmicenja} 
                                </div> 
                                : 
                                <div>
                                    <Route exact path='/admin_takmicenja/pocetna/detalji' component={detaljiTakmicenja} ></Route> 
                                    <Route exact path='/admin_takmicenja/detalji/:adminId/:id/live' component={DetaljiTakmicenja}></Route>
                                </div>
                            }
                        </div>
                    </Router>
                </div>
                : 
                <p className="naslov">Nemate aktivnih takmičenja.</p>
                }
            </div>
        );
    }
}

export default Pocetna;