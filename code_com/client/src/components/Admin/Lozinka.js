import React, {Component} from 'react';

import Sesija from '../Sesija.js';
import '../../css/AdminPage.css';


const axios = require('axios');


class Lozinka extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lozinka : null,
            potvrdaLozinke : null,
            poruka : null
        };

        this.lozinkaUpdate = this.lozinkaUpdate.bind(this);
        this.potvrdaLozinkeUpdate = this.potvrdaLozinkeUpdate.bind(this);
        this.promijeniLozinku = this.promijeniLozinku.bind(this);
    }

    lozinkaUpdate(event) {
        this.setState({lozinka : event.target.value});
    }

    potvrdaLozinkeUpdate(event) {
        this.setState({potvrdaLozinke : event.target.value});
    }

    promijeniLozinku(event) {
        if (this.state.lozinka === this.state.potvrdaLozinke) 
            axios.post('/novaLozinka', {
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token,
                lozinka : this.state.lozinka
            })
            .then(response => {
                if (response.data.success) {
                    this.setState({
                        poruka : 'Lozinka uspješno promijenjena.'
                    });
                }
            });
        else 
            this.setState({
                poruka : 'Lozinke se ne podudaraju.'
            });
    }

    render() {
        var style = {width : '280px', border : '0', borderBottom : '1px solid #66ff66', background : 'transparent'};
        
        return (
            <div style={{marginTop : '2%', marginLeft : '2%'}}>
                <p className="naslov">Promjena <i>default</i>-ne lozinke administratora</p>
                <table className="nivo_2">
                    <tbody>
                        <tr>
                            <td>Nova lozinka: </td>
                            <td><input style={style} type="password" onChange={(e) => this.lozinkaUpdate(e)}></input></td>
                        </tr>
                        <tr>
                            <td>Potvrda lozinke: </td>
                            <td><input style={style} type="password" onChange={(e) => this.potvrdaLozinkeUpdate(e)}></input></td>
                        </tr>
                        <tr>
                            <td colSpan='2'><div className="buttons">
                                <button onClick={(e) => this.promijeniLozinku(e)}>Promijeni lozinku</button>
                            </div></td>
                        </tr>
                        <tr>
                            <td colSpan='2'>{this.state.poruka != null ? <p className="napomena">{this.state.poruka}</p> : null }</td>
                        </tr>
                    </tbody>
                </table>
             </div>   
        );
    }    
};

export default Lozinka;