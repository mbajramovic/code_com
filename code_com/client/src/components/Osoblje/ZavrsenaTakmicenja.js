// prikaz zavrsenih takmicenja
import React, { Component } from 'react';


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



const axios = require('axios');

class Pocetna extends Component {
    constructor(props) {
        super(props);

        this.state = {
            zavrsenaTakmicenja : [],
            id : this.props.idAdmina,
            prikazi : false
        };
        
        localStorage.setItem('adminId', this.state.id);

       

        this.povuciTakmicenja = this.povuciTakmicenja.bind(this);
    }

    componentDidMount() {
        this.povuciTakmicenja();
    }

    povuciTakmicenja() {
        axios.get('/takmicenja', {
            params : {
                id : this.state.id,
                filter : 'zavrsena',
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
                 
                    zavrsenaTakmicenja : takmicenja
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

   
    render() {
        
        const detaljiTakmicenja = () => <DetaljiTakmicenja id={localStorage.getItem('takmicenjeId')} idAdmina={localStorage.getItem('adminId')}/>;
        // detalji ili lista...
        var prikaz = this.state.prikazi;
        if (this.state.zavrsenaTakmicenja.length > 0) 
            this.state.prikazi = !prikaz;

        const zavrsenaTakmicenja = this.state.zavrsenaTakmicenja.map((takmicenje) => (
                <div className="aktivnaTakmicenja">
                    <table><tbody>
                        
                    <tr><td>Takmičenje: {takmicenje.naziv}</td>
                    </tr>
                    <tr>
                        <td className="napomena">Takmičnje je završeno. Klikom na PREGLED možete vidjeti detalje održanog takmičenja.</td>
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
                {this.state.zavrsenaTakmicenja.length > 0 ? 
                <div>
                    <Router>
                        <div className="App"> 
                            {!prikaz ? // prikazi listu takmicenja
                                <div> 
                                    <p className="naslov">Završena takmičenja</p> 
                                    {zavrsenaTakmicenja} 
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
                <p className="naslov">Nemate takmičenja.</p>
                }
            </div>
        );
    }
}

export default Pocetna;