import React, { Component } from 'react';


// prikaz osnovnih informacija o takmičenju
class OsnovneInformacije extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        const takmicenje = this.props.informacije;
        return (
            <div>
                <div>
                    <p className="naslov">Status takmičenja</p>
                    {!takmicenje.zavrseno ? 
                        <h4>Takmičenje je aktivno.</h4>
                    : 
                        <h4>Takmičenje je završeno.</h4>
                    }
                    <p className="naslov">Naziv takmičenja</p>
                    <h4>{takmicenje.naziv}</h4>
                    <p className="naslov">Trajanje takmičenja</p>
                    <h4>{takmicenje.pocetak} - {takmicenje.kraj}</h4>
                    <p className="naslov">Lokacija takmičenja</p>
                    <h4>{takmicenje.mjesto}</h4>
                    <p className="naslov">Razina</p>
                    <h4>{takmicenje.razinaId}</h4>
                    <p className="naslov">Opis</p>
                    <h4>{takmicenje.opis}</h4>
                </div>
            </div>
        )
    }
}



export default OsnovneInformacije;
