// ucesnici iz perspektive administratora (sistema i takmicenja)

import React, { Component } from 'react';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';




import noviUcesnik_logo from  '../../../images/noviUcesnik.png';//'../images/noviUcesnik.png';
import ucesnik_logo from '../../../images/ucesnik.png';

import NoviUcesnik from './NoviUcesnik.js';
import ProfilUcesnika from './ProfilUcesnika.js';

import Sesija from '../../Sesija.js';

const axios = require('axios');

// pregled liste ucesnika
class Ucesnici extends Component {
    constructor(props) {
        super(props);

        this.state = {
            prikazi : true,
            ucesnici : [],
            trenutnaGrupa : this.props.grupe[0],

            odabraniFajl : [],
            ucesniciZaDodati : [],
            poruka : null,
            error : null
        }

        this.brisiUcesnika = this.brisiUcesnika.bind(this);
    }

    componentWillMount() {
        this.povuciUcesnike(this.props.grupe[0].id);
    }


    noviZadatak() {
    }

    takmGrupaUpdate(event) {
        var odabranaGrupa = null;
        this.props.grupe.map((grupa) => {
            if (grupa.id == event.target.value)
                odabranaGrupa = grupa;
        });

        this.setState({
            //prikazi : false,
            trenutnaGrupa : odabranaGrupa
        });
        this.povuciUcesnike(event.target.value);
    }

    povuciUcesnike(takmGrupaId) {
        axios.get('/ucesnici', {
            params : {
                takmicarskeGrupeId : takmGrupaId,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => { 
            if (response.data.success){
                this.setState({
                    ucesnici : response.data.data
                });}
            else {}
        })
        .catch(error => {
            alert(error.message);
        });

    }

    // pri promjene takmicarske grupe nestaje tekst prethodnog zadatka...
    prikazUpdate() {
        this.setState({prikazi : false});
        //history.push('/admin_takmicenja/detalji/6/ucesnici');

    }

    uploadFile() {
        let fd = new FormData();
        fd.append('file', this.state.odabraniFajl[0]);
        fd.append('takmicarskaGrupaId', this.state.trenutnaGrupa.id);

        fd.append('korisnickoIme', Sesija.korisnik.korisnickoIme);
        fd.append('token', Sesija.korisnik.token);

        axios.post('/masovniUnosUcesnikaCSV', fd)
        .then(response => {
            if (response.data.success) {
                this.setState({
                    poruka : 'Učesnici uspješno dodani.'
                });

                this.povuciUcesnike(this.state.trenutnaGrupa.id);
            }
            else
                this.setState({
                    error : response.data.data
                });
        })
        .catch(error => {
            this.setState({
                error : error.toString()
            })
        });
    }

    handleUploadFile(event) {
        var fajl = [];
        fajl.push(event.target.files[0])
        this.setState({odabraniFajl : fajl});
    }

    prikazMasovni() {
        var div = document.getElementById('masovni_unos');
        div.classList.toggle('expanded');
        div.classList.toggle('collapsed');
        if (this.state.poruka != null || this.state.error != null)
            this.setState({
                poruka : null,
                error : null
            });
    }

    brojUcesnikaUpdate(event) {
        var ucesnici = [];
        for (let i = 0; i < event.target.value; i++) {
            var ucesnik = i < 9 ? {'korisnickoIme' : 'ucesnik0' + (i + 1), 'lozinka' : Math.random().toString(36).slice(2) + i + 1} 
                                 : {'korisnickoIme' : 'ucesnik' + (i + 1), 'lozinka' :  Math.random().toString(36).slice(2) + i + 1};
            ucesnici.push(ucesnik);
        }
        this.setState({
            ucesniciZaDodati : ucesnici
        });
    }

    dodajPoBrojuUcesnika() {
        axios.post('/masovniUnosBrojUcesnika', {
            takmicarskaGrupaId : this.state.trenutnaGrupa.id,
            ucesnici : this.state.ucesniciZaDodati,
            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => {
            if (response.data.success) {
                this.setState({
                    poruka : 'Učesnici uspješno dodani.'
                });

                this.povuciUcesnike(this.state.trenutnaGrupa.id);
            }
            else 
                this.setState({
                    error : response.data.data
                });
        })
        .catch(error => {
            this.setState({
                error : error.toString()
            });
        });
    }

    brisiUcesnika(id) {
        axios.get('/brisiUcesnika', {
            params : {
                id : id,
                takmicarskaGrupaId : this.state.trenutnaGrupa.id,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                var ucesnici = this.state.ucesnici;
                for (var i = 0; i < ucesnici.length; i++) {
                    if (ucesnici[i].id == id) {
                        ucesnici.splice(i, 1);
                        break;
                    }
                }
                this.setState({
                    ucesnici : ucesnici
                });
            }
        })
        .catch(error => {

        });
    }

    pristupniPodaci() {
        axios.post('/pristupniPodaci', {
            takmicarskaGrupaId : this.state.trenutnaGrupa.id,

            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => { 
            axios.get('/download',{
                params : {
                    'fileName' : 'Ucesnici.pdf'
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
        })
    }

    render() {   
        var prikaz = this.state.prikazi;
        const noviUcesnik = () => <NoviUcesnik takmGrupaId={this.state.trenutnaGrupa.id} brojUcesnika={this.state.ucesnici.length}/>;
        const profilUcesnika = () => <ProfilUcesnika/>;

        const style={backgroundColor : '#009973', border:'0', borderRadius : '12px'}
        const ucesnici = this.state.ucesnici.map((ucesnik) => (
        <tr><td>
           <Link to={`/admin_takmicenja/ucesnici/ucesnik/${ this.props.adminId }/${ ucesnik.id }`}>
                <table><tbody><tr>
                    <td><img src={ucesnik_logo}></img></td>
                    <td><button className="ucesnik_button" onClick={this.prikazUpdate.bind(this)} >{ucesnik.korisnickoIme}</button></td>
                    <td><button style={style} onClick={(e) => this.brisiUcesnika(ucesnik.id)}>Briši</button></td>
                    <td>
                        <Link to={`/admin_takmicenja/ucesnici/uredi/${ ucesnik.id }`}>
                            <button onClick={this.prikazUpdate.bind(this)} style={style}>Uredi</button> 
                        </Link>
                    </td>
                </tr></tbody></table>
            </Link>
        </td></tr>
        ));

        
            var grupe = this.props.grupe.map((grupa) => (
                <option value={grupa.id}>{grupa.naziv}</option>
            ));
        return (
            <Router >
            <div>
           { prikaz ?      
                <div className="zadaci">
                    <p className="naslov">Takmičarska grupa:</p>
                    <select className="takmGrupa" onChange={this.takmGrupaUpdate.bind(this)}>{grupe}</select>
                    <div className="nivo_2">
                    
                    <p className="naslov">Novi učesnik</p>
                    <table>
                        <tbody>
                            {!this.props.zavrseno ?
                            <tr>
                                <td>
                                    <Link to='/admin_takmicenja/ucesnici/novi'>
                                        <table><tbody><tr>
                                        <td><img src={noviUcesnik_logo} onClick={this.prikazUpdate.bind(this)}></img></td>
                                        <td><button className="ucesnik_button" onClick={this.prikazUpdate.bind(this)}>Novi učesnik</button></td>
                                        </tr></tbody></table>
                                    </Link> 
                                </td>
                            </tr> : null
                            }
                           
                            {!this.props.zavrseno ?
                            <tr>
                                <td>
                                    <table><tbody><tr>
                                        <td><img src={noviUcesnik_logo}></img> </td>
                                        <td style={{textAlign : 'left'}}> 
                                            <button className="ucesnik_button" onClick={this.prikazMasovni.bind(this)}>Masovni unos učesnika</button>
                                            <div className="container-verzije">
                                                <div className="div-verzije" id="masovni_unos">
                                                    <div>
                                                        {this.state.poruka != null ?
                                                            <p className="uspjeh">{this.state.poruka}</p>
                                                            : 
                                                            <div>
                                                                {this.state.greska != null ?
                                                                    <p className="greska">{this.state.greska}</p> :
                                                                    <div>
                                                                        <p className="napomena">Napomena: Masovnim unosom učesnika bit će izbrisani svi prethodno uneseni učesnici.</p>
                                                                        <p className="naslov">Unos preko datoteke</p>
                                                                        <div className="nivo_2">
                                                                            <p className="napomena">Potrebno je izabrati datoteku sa .csv ekstenzijom sa listom učesnika formata KorisnickoIme,Lozinka.</p>
                                                                            <div className="nivo_3">
                                                                                <form><input type="file" onChange={this.handleUploadFile.bind(this)}/></form>
                                                                                <div className="buttons">
                                                                                    <button onClick={this.uploadFile.bind(this)}>Dodaj učesnike</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <p className="naslov">Unos preko broja učesnika</p>
                                                                        <div className="nivo_2">
                                                                            <p className="napomena">Potrebno je da unesete broj učesnika u takmičenju nakon čega se će generisati korisnički podaci.</p>
                                                                            <table className="nivo_3"><tbody>
                                                                                <tr>
                                                                                    <td>Broj učesnika:</td>
                                                                                    <td><input type="number" onChange={this.brojUcesnikaUpdate.bind(this)}/></td>
                                                                                    <td colSpan="2">
                                                                                        <div className="buttons">
                                                                                             <button onClick={this.dodajPoBrojuUcesnika.bind(this)}>Dodaj učesnike</button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody></table>
                                                                        </div>
                                                                    </div>
                                                                }
                                                        </div> 
                                                        }
                                                    </div> 
                                                </div>
                                            </div>
                                        </td>
                                    </tr></tbody></table>
                                </td>
                            </tr> : null 
                            }
                             <tr>
                                <td><p className="naslov">Print</p></td>
                            </tr>
                            <tr>
                                <td>
                                    <table><tbody><tr>
                                        <td><img src={noviUcesnik_logo} ></img></td>
                                        <td><button className="ucesnik_button" onClick={this.pristupniPodaci.bind(this)}>Pristupni podaci za učesnike</button></td>
                                    </tr></tbody></table>
                                </td>
                            </tr>
                            <tr>
                                <td><p className="naslov">Lista učesnika</p></td>
                            </tr>
                            {ucesnici}
                        </tbody>
                    </table>     
                </div></div>: 
                <div>
                    <Route exact path='/admin_takmicenja/ucesnici/novi' component={noviUcesnik}></Route>
                    <Route exact path='/admin_takmicenja/ucesnici/ucesnik/:adminId/:id' component={ProfilUcesnika}></Route>
                    <Route exact path='/admin_takmicenja/ucesnici/uredi/:ucesnikId' component={NoviUcesnik}></Route>
                </div>}
            </div>
            </Router>
        )
    }

}

export default Ucesnici;