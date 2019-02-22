import React, { Component } from 'react';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import Takmicenje from './Takmicenje.js';
import Sesija from '../Sesija.js';

const axios = require('axios');

class PregledTakmicenja extends Component {
    constructor(props) {
        super(props);

        this.state = {
            takmicenja : [],
            prikaz : false,

            poruka : '',

            greska : null
        }

        this.povuciTakmicenja = this.povuciTakmicenja.bind(this);
    }

    updatePrikaz() {
        var prikaz = this.state.prikaz;
        this.setState({
            prikaz : !prikaz
        });
    }
    componentWillMount() {
        this.povuciTakmicenja();
    }

    povuciTakmicenja() {
        axios.get('/takmicenja', {
            params : {
                filter : 'aktivna',
                
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token

            }
        })
        .then(response => {
            if (response.data.success) 
                this.setState({
                    takmicenja : response.data.data
                });
            else
                this.setState({
                    poruka : response.data.data
                })
        })
        .catch(error => {
            this.setState({
                poruka : error.toString()
            });
        });
    }

    brisiTakmicenje(id) {
        axios.get('/brisiTakmicenje', {
            params : {
                id : id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                var takmicenja = this.state.takmicenja;
                for (var i = 0; i < takmicenja.length; i++) {
                    if (takmicenja[i].id == id) {
                        takmicenja.splice(i, 1);
                        break;
                    }
                }
                this.setState({
                    takmicenja : takmicenja,
                    poruka : 'Takmičenje uspješno izbrisano.'
                });
                this.prikaziDetalje();
            }
        })
        .catch(error => {
            this.setState({
                poruka : error.toString()
            });
        });
    }

    prikaziDetalje() {
        document.getElementById("mySidenav").style.height = "30%";
    }
        
    closeNav() {
        document.getElementById("mySidenav").style.height = "0";
    }


    render() {
        const takmicenja = this.state.takmicenja.map((takmicenje, i) => (
            <div className="aktivnaTakmicenja">
                <table><tbody>     
                <tr>
                    <td>Takmičenje: {takmicenje.naziv}</td>
                </tr>
                <tr>
                   <td>
                       <p className="napomena">Takmičenje još nije otvoreno.</p>
                    </td>
                    <td>    
                        <button onClick={(e) => this.brisiTakmicenje(takmicenje.id)}>Briši</button>
                    </td>
                    <td>    
                        <Link to={`/administrator/${ takmicenje.id }`}>
                            <button onClick={this.updatePrikaz.bind(this)}>Uredi</button>
                        </Link>
                    </td>
                </tr>
                </tbody></table>
            </div>
        ));
        var t = () => <Takmicenje />
        
        return (
            <Router>
                <div>
                {!this.state.prikaz ? 
                <div>
                    <p className="naslov">Takmičenja</p>
                    {takmicenja}
                  
                </div>
                :
                <div>
                    <Route exact path='/administrator/:takmicenjeId' component={Takmicenje}></Route>
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
                                            <p className="napomena">{this.state.poruka}</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> 
                </div>
            </Router>
        )
    }
}

export default PregledTakmicenja;