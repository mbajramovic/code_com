import React, { Component } from 'react';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import logo from '../../../images/zadatak_logo.png';
import nz_logo from '../../../images/novizadatak_logo.png';


import NoviZadatak from './NoviZadatak.js';
import PregledZadatka from './PregledZadatka.js';
import Sesija from '../../Sesija.js';

const axios = require('axios');


class Zadaci extends Component {
    constructor(props) {
        super(props);

        this.state = {
            prikazi : false,
            zadaci : [],
            trenutnaGrupa : this.props.grupe[0]
        }
    }

    noviZadatak() {
    }

    componentWillMount() {
        this.povuciZadatke(this.props.grupe[0].id);
    }



    takmGrupaUpdate(event) {
        var odabranaGrupa = null;
        this.props.grupe.map((grupa) => {
            if (grupa.id == event.target.value)
                odabranaGrupa = grupa;
        });

        this.setState({
            prikazi : false,
            trenutnaGrupa : odabranaGrupa
        })
        this.povuciZadatke(event.target.value);
    }

    povuciZadatke(takmGrupaId) {
        axios.get('/zadaci', {
            params : {
                takmicarskeGrupeId : takmGrupaId,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => { 
            if (response.data.success){
                this.setState({
                    zadaci : response.data.data
                });}
            else {}
        })
        .catch(error => {
            alert(error.toString());
        });
    }

    exportAsPdf() {
        axios.post('/zadaciUPdf', {
            takmicarskaGrupaId : this.state.trenutnaGrupa.id,
            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => { 
            axios.get('/download',{
                params : {
                    'fileName' : 'Zadaci.pdf'
                },
                responseType: 'blob'
            }).then(response => {
                const file = new Blob(
                    [response.data], 
                    {type: 'application/pdf'});
                const fileUrl = URL.createObjectURL(file);
                window.open(fileUrl);
            }).catch(error => {
                alert(error.toString());
            });
        })
        .catch(error => {
            alert(error.toString());
        });
    }

    // pri promjene takmicarske grupe nestaje tekst prethodnog zadatka...
    prikazUpdate() {
        this.setState({prikazi : true});
    }

    render() {   
        var prikaz = this.state.prikazi;
        
        const noviZadatak = () => <NoviZadatak odabranaGrupa={this.state.trenutnaGrupa} brojDefinisanihZad={this.state.zadaci.length} adminId={this.props.adminId} />;
        const pregledZadatka = () => <PregledZadatka adminId={this.props.adminId}/>;

        const zadaci = this.state.zadaci.map((zadatak) => (
        <td>
           <Link to={`/admin_takmicenja/zadaci/zadatak/${ this.props.adminId }/${ zadatak.id }`}>
                <img src={logo}></img><br/>
                <button className="zadatak_button" onClick={this.prikazUpdate.bind(this)}>Zadatak {zadatak.redniBroj}</button>
            </Link>
        </td>
        ));

        var grupe = this.props.grupe.map((grupa, i) => (
            <option value={grupa.id} defaultChecked>{grupa.naziv}</option>
        ));
        return (
            <Router>
            <div>
                <div className="zadaci">
                    <p className="naslov">Takmičarska grupa:</p>
                    <select  className="takmGrupa" onChange={this.takmGrupaUpdate.bind(this)}>{grupe}</select>
                    <div className="nivo_2">
                    <p className="naslov">Zadaci</p>
                    <table>
                        <tbody>
                            <tr>
                                {!this.props.zavrseno ?
                                <td>
                                    <Link to='/admin_takmicenja/zadaci/novi'>
                                        <img src={nz_logo} onClick={this.prikazUpdate.bind(this)}></img><br/>
                                        <button className="zadatak_button">Novi zadatak</button>
                                    </Link>
                                </td> :
                                null 
                                }
                                {zadaci}
                                {zadaci.length > 0 ? 
                                <td>
                                    <div className="buttons" style={{textAlign : 'right', marginBottom : '10px'}}>
                                        <button onClick={this.exportAsPdf.bind(this)}>PDF verzija</button>
                                    </div>
                                </td> : null}
                            </tr>
                        </tbody>
                    </table>     
                    
                </div>
                {prikaz ? <div className="pregledZadatka">
                   <Route exact path='/admin_takmicenja/zadaci/novi' component={noviZadatak}></Route>
                   <Route exact path='/admin_takmicenja/zadaci/zadatak/:adminId/:id' component={PregledZadatka}></Route>
                </div> : <div className="pregledZadatka">
                    <Route exact path='/admin_takmicenja/zadaci/novi' component={noviZadatak}></Route>
                </div>} </div> 
                
            </div>
            </Router>
        )
    }
}

export default Zadaci;