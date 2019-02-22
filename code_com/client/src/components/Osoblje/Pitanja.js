import React, { Component } from 'react';
import io from 'socket.io-client';
import Sesija from '../Sesija.js';

const axios = require('axios');

class Pitanja extends Component {
    constructor(props) {
        super(props);

        this.state = {
            takmicenjeId : this.props.idTakmicenja,

            odgovorenaPitanja : [],
            neodgovorenaPitanja : [],

            tekstualniOdgovor : false,

            tekstOdgovora : 'Da',
            posaljiSvima : false,

            trenutnoPitanje : -1
        }

        this.povuciPitanja = this.povuciPitanja.bind(this);
        this.posaljiOdgovor = this.posaljiOdgovor.bind(this);

        this.socket = io('localhost:5000');
        this.socket.on('NOVO_PITANJE', (data) => {
            var pitanje = data.pitanje;
            var neodgovorenaPitanja = this.state.neodgovorenaPitanja;
            neodgovorenaPitanja.push(pitanje);
            this.setState({
                neodgovorenaPitanja : neodgovorenaPitanja
            });
        });
    }

    componentWillMount() {
        this.povuciPitanja();
    }


    povuciPitanja() {
        axios.get('/svaPitanja', {
            params : {
                takmicenjeId : this.state.takmicenjeId,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) 
                this.setState({
                    odgovorenaPitanja : response.data.odgovorenaPitanja,
                    neodgovorenaPitanja : response.data.neodgovorenaPitanja
                });
        });
    }

    posaljiOdgovor() {
        axios.post('/noviOdgovor', {
            tekst : this.state.tekstOdgovora,
            odgovorZaSve : this.state.posaljiSvima,
            pitanjeId : this.state.trenutnoPitanje,
            
            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => {
            if (response.data.success) {
                var neodgovorenaPitanja = this.state.neodgovorenaPitanja;
                var i = 0;
                for (i = 0; i < neodgovorenaPitanja.length; i++) {
                    if (neodgovorenaPitanja[i].id == response.data.odgovor.pitanjaId) {
                        break;
                    }
                }
                
                var _response = response.data.odgovor;
                var odgovorenaPitanja = this.state.odgovorenaPitanja;
                var odgovor = {
                    'id' : _response.id,
                    'tekstOdgovora' : _response.tekstOdgovora,
                    'odgovorZaSve' : _response.odgovorZaSve,
                    'pitanjaId' : _response.pitanjaId,
                    'pitanja' : {
                        'id' : neodgovorenaPitanja[i].id,
                        'tekstPitanja' : neodgovorenaPitanja[i].tekstPitanja,
                        'ucesnici' : {
                            'id' : neodgovorenaPitanja[i].ucesnici.id,
                            'korisnici' : {
                                'korisnickoIme': neodgovorenaPitanja[i].ucesnici.korisnici.korisnickoIme
                            }
                        }
                    }
                };

                odgovorenaPitanja.push(odgovor);
                neodgovorenaPitanja.splice(i, 1);

                var odgovorZaPoslati = _response;
                odgovorZaPoslati.ucesnikId = odgovor.pitanja.ucesnici.id;
                odgovorZaPoslati.pitanja = {
                    'id' : odgovor.pitanja.id,
                    'tekstPitanja' : odgovor.pitanja.tekstPitanja
                };
                this.socket.emit('NOVI_ODGOVOR', {
                    odgovor : odgovorZaPoslati
                });

                this.setState({
                    neodgovorenaPitanja : neodgovorenaPitanja,
                    odgovorenaPitanja : odgovorenaPitanja
                });
            }
        });
    }

    prikazPitanja(e) {
        var div = document.getElementById('prikaz_pitanja' + e.target.value);
        div.classList.toggle('expanded');
        div.classList.toggle('collapsed');
        this.setState({
            trenutnoPitanje : e.target.value
        })
    }

    tekstOdgovoraUpdate(e) {
        this.setState({
            tekstOdgovora : e.target.value
        });
    }

    odgovorUpdate(e) {
        if (e.target.value != 'tekstualniOdgovor')
            this.setState({
                tekstOdgovora : e.target.options[e.target.selectedIndex].value
            });
        else 
            this.setState({
                tekstualniOdgovor : true
            });
    }

    posaljiSvimaUpdate(e) {
        this.setState({
            posaljiSvima : e.target.checked
        });
    }

    render() {
        var neodgovorenaPitanja = this.state.neodgovorenaPitanja.map((pitanje, i) => (
            <li>
                <button className="pitanja_button" value={pitanje.id} onClick={this.prikazPitanja.bind(this)}>{(i + 1).toString() + ". " + pitanje.tekstPitanja + "(" + pitanje.ucesnici.korisnici.korisnickoIme + ")"}</button> 
                <div className="container-verzije">
                    <div className="div-verzije" id={"prikaz_pitanja" + pitanje.id} >
                        <table style={{marginTop : '4%', marginLeft : '4%', border : '1px solid #009973', borderRadius : '12px', width : '90%'}}><tbody>
                            <tr>
                                <td>Odgovor:
                                    <select onChange={this.odgovorUpdate.bind(this)}>
                                        <option value="da">Da</option>
                                        <option value="ne">Ne</option>
                                        <option value="Bez odgovora">Bez odgovora</option>
                                        <option value="tekstualniOdgovor">Napiši odgovor</option>
                                    </select>
                                </td>
                            </tr>
                            {this.state.tekstualniOdgovor == true ? 
                            <tr>
                                <td>
                                    <textarea className="maliText" onChange={this.tekstOdgovoraUpdate.bind(this)}></textarea>
                                </td>
                            </tr>
                            : null}
                            <tr>
                                <td>
                                    <input type="checkbox" onChange={this.posaljiSvimaUpdate.bind(this)}></input>Pošalji odgovor svim učesnicima
                                </td>
                            </tr>
                        </tbody></table>
                        <div className="buttons" style={{margin : '0', marginTop : '1%', marginBottom : '3%'}}>
                            <button onClick={this.posaljiOdgovor.bind(this)}>Pošalji odgovor</button>
                        </div>
                    </div>
                </div>
            </li>
        ));

        var odgovorenaPitanja = this.state.odgovorenaPitanja.map((pitanje, i) => (
            <li>
                <button className="pitanja_button" value={pitanje.pitanja.id} onClick={this.prikazPitanja.bind(this)}>{(i + 1).toString() + ". " + pitanje.pitanja.tekstPitanja + " (" + pitanje.pitanja.ucesnici.korisnici.korisnickoIme + ")"}</button>
                <div className="container-verzije">
                    <div className="div-verzije" id={"prikaz_pitanja" + (pitanje.pitanja.id).toString()}>
                        <div style={{textAlign : 'left', marginLeft : '5%', marginBottom : '3%'}}>
                            <div>
                                <span>{pitanje.tekstOdgovora}</span>
                            </div>
                            {pitanje.odgovorZaSve == true ? 
                            <div>
                                <span>Napomena: Ovaj odgovor vide svi učesnici takmičenja.</span>
                            </div>
                            : null}
                        </div>
                    </div>
                </div>
            </li>
        ));

        return (
            <div>
                <p className="naslov">Pitanja</p>
                <div className="nivo_2">
                    <p className="naslov">Neodgovorena pitanja ({this.state.neodgovorenaPitanja.length})</p>
                    <div className="nivo_3">
                        <ul>
                            {neodgovorenaPitanja}
                        </ul>
                    </div>
                </div>
                <div className="nivo_2">
                    <p className="naslov">Ostala pitanja</p>
                    <div className="nivo_3">
                        <ul>
                            {odgovorenaPitanja}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

export default Pitanja;