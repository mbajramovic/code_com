import React, { Component } from 'react';

import Sesija from '../Sesija.js';


const axios = require('axios');

class Autotestovi extends Component {
    constructor(props) {
        super(props);

        this.state = {
            poruka : null
        }

        this.azurirajAutotestove = this.azurirajAutotestove.bind(this);
    }

    azurirajAutotestove() {
        axios.post('/otvoriTakmicenje', {
            id : this.props.takmicenjeId,
            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => {
            if (response.data.success == 'yes') {
                this.setState({poruka : 'Autotestovi su uspješno ažurirani. Za ponovno testiranje rješenja, izaberite opciju \'Rang lista\' te evaluirajte ponovo rješenja.'})
            }
            else {
                this.setState({poruka : response.data.data});
            }
        })
    }

    render() {
        return (
            <div>
                <p className="napomena">Da biste izmijenili ranije definisane autotestove, potrebno je da slijedite sljedeće korake:</p>
                <table>
                    <tbody>
                        <tr><td><p className="napomena">1.</p></td><td><p className="napomena">Izaberite opciju 'Zadaci' iz menija na lijevoj strani.</p></td></tr>
                        <tr><td><p className="napomena">2.</p></td><td><p className="napomena">Odaberite zadatak za koji želite mijenjati autotestove.</p></td></tr>
                        <tr><td><p className="napomena">3.</p></td><td><p className="napomena">Upišite željeni programski jezik i dodajte autotestove (kao pri prvom definisanju autotestova).</p></td></tr>
                        <tr><td><p className="napomena">4.</p></td><td><p className="napomena">Nakon što ste spremili dodane autotestove (Save and Export), vratite se opet na ovu stranicu.</p></td></tr>
                         <tr><td><p className="napomena">5.</p></td><td><p className="napomena">Klikom na dugme ispod ('Ažuriraj autotestove'), autotestovi će se ažurirati.</p></td></tr>
                         <tr><td><p className="napomena">6.</p></td><td><p className="napomena">Izberite opciju 'Rang lista' iz menija na lijevoj strani i ponovo evaluirajte rješenja.</p></td></tr>
                    </tbody>
                </table>
                <div className="buttons">
                    <button onClick={(e) => this.azurirajAutotestove()}>Ažuriraj autotestove</button>
                </div>
                {this.state.poruka != null ? <p className="napomena">{this.state.poruka}</p> : null}
             </div>   
        );
    }
}

export default Autotestovi;