import React, { Component } from 'react';
import Sesija from '../Sesija.js';

const axios = require('axios');

class ProsirenaRangLista extends Component {
    constructor(props) {
        super(props);

        this.state = {
            grupe : this.props.grupe,
            odabranaGrupa : this.props.grupe != null ? this.props.grupe[0] : null,
            kriterij : 'skola',
            takmicenjeId : this.props.takmicenjeId,

            isSve : false,

            rangLista : null,
            zadaci : null
        }
    }

    takmGrupaUpdate(event) {
        if (event.target.value == 'ukupni') {
            this.setState({
                isSve : true
            });
            this.povuciListu(-1, this.state.kriterij);
        }
        else {
            var odabranaGrupa = null;
            this.props.grupe.map((grupa) => {
                if (grupa.id == event.target.value)
                    odabranaGrupa = grupa;
            });

            this.setState({
                prikazi : false,
                trenutnaGrupa : odabranaGrupa,
                isSve : false
            })
            this.povuciListu(event.target.value, this.state.kriterij);
        }
    }
    
    updateKriterij(e) {
        this.setState({
            kriterij : e.target.value
        });
        alert(this.state.odabranaGrupa.id)
        if (this.state.isSve)
        this.povuciListu(-1, e.target.value);
        else
            this.povuciListu(this.state.odabranaGrupa.id, e.target.value);
    }

    povuciListu(id, kriterij) {
        axios.get('/rangLista', {
            params : {
                takmicarskaGrupaId : id,
                vrsta : kriterij,
                takmicenjeId : this.state.takmicenjeId,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                console.log(response.data.data);
                this.setState({
                    rangLista : response.data.data
                });
            }
        })
        .catch(error => {
            alert(error.toString());
        })
    }


    render() {
        var grupe = this.state.grupe.map((grupa) => (
            <option value={grupa.id}>{grupa.naziv}</option>
        ));

        var ranglista = this.state.rangLista != null ? this.state.rangLista.map((item, i) => (
            <tr id="cel">
                <td>{i + 1}</td>
                <td>{item.item}</td>
                <td>{item.bodovi}</td>
            </tr>
        )) : null;

        return(
            <div>
                <div>
                    <p className="naslov">Takmičarska grupa</p>
                    <select className="takmGrupa" onChange={this.takmGrupaUpdate.bind(this)}>
                        {grupe}
                        <option value="ukupni">Ukupni poredak (sve grupe)</option>
                    </select>
                </div>
                <div>
                    <p className="naslov">Kriterij</p>
                    <div>
                        <table><tbody>
                            <tr>
                                <td>
                                    <input type="radio" name="vrsta" value="skola" onClick={(e) =>this.updateKriterij(e)}></input>
                                    <label for="skola">Poredak po školama</label>
                                </td>
                                <td>
                                    <input type="radio" name="vrsta" value="opcina" onClick={(e) =>this.updateKriterij(e)}></input>
                                    <label for="opcina">Poredak po općinama</label>
                                </td>

                                <td>
                                    <input type="radio" name="vrsta" value="kanton" onClick={(e) =>this.updateKriterij(e)}></input>
                                    <label for="kanton">Poredak po kantonima</label>
                                </td>
                                <td>
                                    <input type="radio" name="vrsta" value="drzava" onClick={(e) =>this.updateKriterij(e)}></input>
                                    <label for="drzava">Poredak po državama</label>
                                </td>
                            </tr>
                       </tbody></table>
                    </div>
                </div>
                <div>
                    <p className="naslov">Rang lista</p>
                    <div className="nivo_3">
                        <table><tbody>
                            <tr id="cel">
                                <th>Redni broj</th>
                                <th>{this.state.kriterij}</th>
                                <th>Bodovi</th>
                            </tr>
                            {ranglista}
                        </tbody></table>
                    </div>
                </div>
            </div>
        )
    }
}

export default ProsirenaRangLista;