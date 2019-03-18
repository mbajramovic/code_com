import React, { Component } from 'react';


import NoviZadatak from './NoviZadatak.js';

import Sesija from '../../Sesija.js';


import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import Autotestovi from '../Autotestovi.js';
import Greska from '../../Greska.js';

const axios = require('axios');



// pregled postavke zadatka
class PregledZadatka extends Component {
    constructor(props) {
        super(props);
        //alert(this.props.adminId);
        this.state = {
            zadatak : null,
            admini : null,
            pregled : true,
            autorID : -1,
            autorInd : -1,
            html : null,
            jezik : "C",
            greska : null
        };
        this.povuciZadatak = this.povuciZadatak.bind(this);
        this.openGenerator = this.openGenerator.bind(this);
    }

    componentDidMount() {
        this.povuciZadatak();
    }

    updatePregled() {
        this.setState({
            pregled : false
        });
    }

    componentWillReceiveProps(nextProps, nextState) {
        this.props = nextProps;
        this.povuciZadatak();
       // this.setState({zadatak : null});
    }

    
    povuciZadatak() {
        axios.get('/zadatak', {
            params : {
                id : this.props.match.params.id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                console.log(response.data);
                this.setState({
                    zadatak : response.data.data,
                    admini : response.data.admini,
                    autorInd : response.data.autorInd
                }); }
            else {
                console.log(response.data);
                this.setState({
                    greska : response.data.data
                });
                Greska.prikaziDetalje();
            }
        })
        .catch(error => {
            this.setState({
                greska : error.toString()
            });
        });
    }

    openGenerator() {
      
        axios.get('/_index.html', {

        })
        .then(response => {
   
            var w = window.open();
            w.localStorage.setItem("Zamger_URL_Autotest", '/autotestovi'); 
            w.localStorage.setItem('id', this.state.zadatak.id);
            w.localStorage.setItem('jezik', this.state.jezik);
            w.document.write(response.data);

        })
        .catch(error => {
            this.setState({
                greska : error.toString()
            });
        });
    }

    updateJezik(event) {
        this.setState({jezik : event.target.value});
    }

    render() {
        const zadatak = this.state.zadatak;
        var _admini = this.state.admini; 
        var admini = null; 
        var autor = null;
        var autorID = -1;
        
        if (this.state.admini) {
            if (_admini.length > 0) {
                this.state.autorID = _admini[this.state.autorInd].id;
                autor = <h4>{_admini[this.state.autorInd].ime} {_admini[this.state.autorInd].prezime}</h4>
                _admini = _admini.filter(admin => admin.id != this.state.autorID);
                admini = _admini.map((admin) => (
                    <h4>{admin.ime} {admin.prezime}</h4>
                ));
            }
        }
        const noviZadatak = () => <NoviZadatak zadatak={this.state.zadatak}  adminId={this.props.match.params.adminId} autorID={this.state.autorID}/>
        const autotestovi = () => <Autotestovi zadatak={this.state.zadatak}/>
        const greska = () => <Greska greska={this.state.greska}/>
       
        // pregled zadatka ili uredi ?!
        var pregled = this.state.pregled;
        if (this.state.pregled == true) this.state.pregled = true;
        else
            this.state.pregled = !pregled;

        return (
            <Router>
                {zadatak ?
                <div className="nivo_3">
                    {pregled ?
                    <div>
                    <p className="naslov">Zadatak {zadatak.redniBroj}</p>
                    <div className="nivo_4">
                       
                        <table className="ucesnik_button" style={{border : "0px"}}>
                        <tbody><tr><td>
                        <select style={{marginRight : '2%'}} onChange={(e) => this.updateJezik(e)}>
                            <option value="C">C</option>
                            <option value="C++">C++</option>
                            <option value="Pascal">Pascal</option>
                            <option value="QBasic">QBasic</option>
                        </select></td><td>
                        <button  style={{color : 'green', background : 'transparent', border : '0px', textDecoration : 'underline'}} onClick={(e) => this.openGenerator(e)}>Prikaži definisane autotestove</button></td>
                        </tr></tbody></table>
                        <p className="naslov">Naslov:</p>
                        <h4>{zadatak.naslov}</h4>
                        <p className="naslov">Tekst:</p>
                        <textarea readOnly style={{whiteSpace : 'pre-line', width : '500px', height : '150px'}}>{zadatak.tekst}</textarea>
                        <p className="naslov">Ulaz:</p>
                        <textarea readOnly  style={{whiteSpace : 'pre-line', width : '500px', height : '150px'}}>{zadatak.ulaz}</textarea>
                        <p className="naslov">Izlaz:</p>
                        <textarea readOnly  style={{whiteSpace : 'pre-line', width : '500px', height : '150px'}}>{zadatak.izlaz}</textarea>
                        <p className="naslov">Oblast:</p>
                        <h4>{zadatak.oblast}</h4>
                        <p className="naslov">Bodovi:</p>
                        <h4>{zadatak.bodovi}</h4>
                        <p className="naslov">Autor:</p>
                        <h4>{autor}</h4>
                        
                        {admini.length > 0 ? 
                            <div><p className="naslov">Uredili:</p>
                            <h4>{admini}</h4></div> 
                        : null }
                        {zadatak.dozvoliIzmjene || this.state.autorID == this.props.match.params.adminId ? 
                            <div className="buttons">
                                <Link to='/admini_takmicenja/zadaci/zadatak/uredi'>
                                    <button onClick={this.updatePregled.bind(this)}>UREDI</button>
                                </Link>
                            
                        </div> : 
                            <p className="naslov">Autor zadatka je zabranio izmjene na ovom zadatku.</p>
                        }
                    </div></div>
                    : <div>
                         
                        <Route exact path='/admini_takmicenja/zadaci/zadatak/uredi' component={noviZadatak}></Route> 
                      
                      </div>
                    }
                </div>
                : null
                }
                
            </Router>
        );
    }
    
}

export default PregledZadatka;