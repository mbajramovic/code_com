import React, { Component } from 'react';

// prikaz pravila takmicenja
class Pravila extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const pravila = this.props.pravilaTakmicenja;
        const vrsta = this.props.vrsta;
        const grupe = this.props.grupe;

        var grupeZaPrikaz = grupe.map((grupa, i) => (
            <tr id="cel">
                <td>{grupa.naziv}</td>
                {grupa.brojTakmicara > 0 ?
                    <td>{grupa.brojTakmicara}</td>
                : 
                    <td>Nije definisano.</td>
                }
                {grupa.brojZadataka > 0 ?
                    <td>{grupa.brojZadataka}</td>
                : 
                    <td>Nije definisano.</td>
                }
            </tr>
        ));
        return (
            <div>
                <div>
                    <p className="naslov">Takmičarske grupe</p>
                    <div className="nivo_2">
                        <table><tbody>
                            <tr id="cel">
                                <th>Naziv</th>
                                <th>Broj takmičara</th>
                                <th>Broj zadataka</th>
                            </tr>
                            {grupeZaPrikaz}
                        </tbody></table>
                    </div>
                    <div>
                        <p className="naslov">Programski jezik</p>
                        <div className="nivo_2">
                            <p>{this.props.jezik}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Pravila;
