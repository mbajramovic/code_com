import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import PredaneVerzije from './PredaneVezije.js';
import Sesija from '../Sesija.js';

const axios = require('axios');

class Postavka extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            id : this.props.match.params.id,
            error : null,
            zadatak : null,

            prikaz : false
        }

        this.povuciZadatak = this.povuciZadatak.bind(this);
    }

    componentWillMount() {
        this.povuciZadatak(null);
    }

    componentWillReceiveProps(nextProps) {
        this.povuciZadatak(nextProps);
    }
    
    povuciZadatak(nextProps) {
        axios.get('/zadatak', {
            params : {
                id : nextProps ? nextProps.match.params.id : this.props.match.params.id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success)
                this.setState({zadatak : response.data.data, prikaz : false});
            else
                this.setState({error : response.data.data});
        })
        .catch(error => {
            this.setState({error : error.message});
        });
    }

    render() {
        const zadatak = this.state.zadatak;

        return(
            <div>
                {this.state.error != null ?
                <div>
                    <p className="greska">{this.state.error}</p>
                </div> :
                <div>
                    {zadatak != null ?
                    <div>
                        <div className="nivo_2">
                            <p className="naslov">Naslov:</p>
                            <h4>{zadatak.naslov}</h4>
                            <p className="naslov">Tekst:</p>
                            <h4>{zadatak.tekst}</h4>
                            <p className="naslov">Ulaz:</p>
                            <h4>{zadatak.ulaz}</h4>
                            <p className="naslov">Izlaz:</p>
                            <h4>{zadatak.izlaz}</h4>
                            <p className="naslov">Oblast:</p>
                            <h4>{zadatak.oblast}</h4>
                        </div>
                    </div> : 
                    null}
                </div>}
            </div>
        )
    }
}

class PregledZadatka extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id : this.props.match.params.id,
            redniBroj : this.props.match.params.redniBroj,
            //zadatak : null,
            error : null,
            ucesnikId : this.props.match.params.ucesnikId,
            takmicenjeId : this.props.match.params.takmicenjeId,
            prikaz : false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            id : nextProps.match.params.id,
            redniBroj : nextProps.match.params.redniBroj,
            prikaz : false
        });
    }

    prikazUpdate() {
        this.setState({prikaz : true});
    }

    
    
    render() {
 
        return(
            <Router>
                <div>
                    <div className="infomenu">
                    <p className="naslov">Zadatak {this.state.redniBroj}</p>
                        <ul className="containermenu">
                            <li>
                                <Link to={`/ucesnik/zadatak/${ this.state.id }/${this.state.redniBroj}/postavka`}>
                                    <button onClick={this.prikazUpdate.bind(this)}>Postavka</button>
                                </Link>
                            </li>
                            <li>
                                <Link to={`/ucesnik/zadatak/${ this.state.id }/${this.state.redniBroj}/${this.state.ucesnikId}/${this.state.takmicenjeId}/verzije`}>
                                    <button onClick={this.prikazUpdate.bind(this)}>Novo rješenje</button>
                                </Link>
                         </li>
                        </ul>
                    </div>
                    {this.state.prikaz ? 
                    <div className="infocontainer">
                        <Route exact path='/ucesnik/zadatak/:id/:redniBroj/postavka' component={Postavka}></Route>
                        <Route exact path='/ucesnik/zadatak/:id/:redniBroj/:ucesnikId/:takmicenjeId/verzije' component={PredaneVerzije}></Route>
                    </div> : null }
                </div>
            </Router>
        );
    }
 
}

export default PregledZadatka;