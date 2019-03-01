import React, { Component } from 'react';
import io from 'socket.io-client';
import Sesija from '../Sesija.js';

const axios = require('axios');
const server = require('../../serverinfo.json').server;

class Pitanja extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ucesnikId : this.props.match.params.ucesnikId,
            tekstPitanja : '',

            odgovorenaPitanja : [],
            neodgovorenaPitanja : [],

            poruka : '',
            greska : ''
        }

        this.socket = io(server.ip + ':' + server.port);
        this.socket.on('NOVI_ODGOVOR' + this.state.ucesnikId, (data) => {
            console.log(data.odgovor);
            var odgovorenaPitanja = this.state.odgovorenaPitanja;
            var neodgovorenaPitanja = this.state.neodgovorenaPitanja;
            for (var i = 0; i < neodgovorenaPitanja.length; i++)
                if (neodgovorenaPitanja[i].id == data.odgovor.pitanja.id)
                    neodgovorenaPitanja.splice(i, 1);
            odgovorenaPitanja.push(data.odgovor);
            this.setState({
                odgovorenaPitanja : odgovorenaPitanja,
                neodgovorenaPitanja : neodgovorenaPitanja
            });
        });

        this.povuciPitanja();
    }

    componentWillMount() {
       // this.povuciPitanja();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            ucesnikId : nextProps.match.params.ucesnikId
        });
        this.povuciPitanja();
    }

    postaviPitanje() {
        axios.post('/novoPitanje', {
            ucesnikId : this.state.ucesnikId,
            tekstPitanja : this.state.tekstPitanja,
            takmicenjeId : this.props.match.params.takmicenjeId,

            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => {
            if (response.data.success) {
                var neodgovorenaPitanja = this.state.neodgovorenaPitanja;
                neodgovorenaPitanja.push(response.data.pitanje);

                var pitanje = response.data.pitanje;
                this.socket.emit('NOVO_PITANJE', {
                    pitanje : response.data.pitanje
                })
                this.setState({
                    neodgovorenaPitanja : neodgovorenaPitanja,
                    poruka : 'Pitanje je postavljeno.'
                });
            }
            else
                this.setState({
                    greska : response.data.data
                });
        })
        .catch(error => {
            this.setState({
                greska : error.toString()
            })
        });
    }



    povuciPitanja() {
        axios.get('/pitanjaZaUcesnika', {
            params : {
                ucesnikId :  this.state.ucesnikId,

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
            else
                this.setState({
                    greska : response.data.data
                });
        })
        .catch(error => {
            this.setState({
                greska : error.toString()
            });
        });
    }

    tekstPitanjaUpdate(event) {
        this.setState({
            tekstPitanja : event.target.value
        });
    }

    prikazPitanja(e) {
        var div = document.getElementById('prikaz_pitanja' + e.target.value);
        div.classList.toggle('expanded');
        div.classList.toggle('collapsed');
    }



    render() {
        var neodgovorenaPitanja =  this.state.neodgovorenaPitanja.map((pitanje, i) => (
            <li>
                <button className="pitanja_button" value={i} onClick={this.prikazPitanja.bind(this)}>{(i + 1).toString() + ". " + pitanje.tekstPitanja}</button>
                <div className="container-verzije">
                    <div className="div-verzije" id={"prikaz_pitanja" + i}>
                    <div>
                        <span>Pitanje još uvijek nije odgovoreno.</span>
                    </div>
                    </div>
                </div>
            </li>
        ));
        var s = this.state.neodgovorenaPitanja.length;
        var odgovorenaPitanja =  this.state.odgovorenaPitanja.map((pitanje, i) => (
            <li>
                {pitanje.odgovorZaSve ?  <button className="pitanja_button" value={s + i} onClick={this.prikazPitanja.bind(this)}>{(i + 1).toString() + ". " + pitanje.pitanja.tekstPitanja + " (odgovor vide svi učesnici)"}</button>
               : <button className="pitanja_button" value={s + i} onClick={this.prikazPitanja.bind(this)}>{(i + 1).toString() + ". " + pitanje.pitanja.tekstPitanja}</button>}
                <div className="container-verzije">
                    <div className="div-verzije" id={"prikaz_pitanja" + (s + i).toString()}>
                        <div>
                            <span>{pitanje.tekstOdgovora}</span>
                        </div>
                    </div>
                </div>
            </li>
        ));

        return (
            <div>
                <p className="naslov">Pitanja</p>
                <div className="nivo_2">
                    <p className="naslov">Novo pitanje</p>
                    
                    <div className="nivo_3">
                        {this.state.poruka.length > 0 ? 
                            <p className="uspjeh">{this.state.poruka}</p> 
                        : null}
                        {this.state.greska.length > 0 ?
                            <p className="greska">{this.state.greska}</p>
                        : null}
                        <textarea placeholder="Ovdje unesite tekst pitanja" className="maliText" onChange={this.tekstPitanjaUpdate.bind(this)}></textarea>
                        <div className="buttons">
                            <button onClick={this.postaviPitanje.bind(this)}>Pošalji pitanje</button>
                        </div>
                    </div>
                </div>
                <div className="nivo_2">
                    <p className="naslov">Neodgovorena pitanja</p>
                    <div className="nivo_3">
                        <ul>
                            {neodgovorenaPitanja}
                        </ul>
                    </div>
                </div>
                <div className="nivo_2">
                    <p className="naslov">Odgovori</p>
                    <div className="nivo_3">
                        <p className="napomena">Za pregled odgovora kliknite na željeno pitanje. Među odgovorima će se nalaziti i pitanja drugih učesnika koja su administratori takmičenja odlučili prikazati svim učesnicima.</p>
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