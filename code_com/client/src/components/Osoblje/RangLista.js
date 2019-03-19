import React, { Component } from 'react';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

import JSZip from 'jszip';
import io from 'socket.io-client';
import Sesija from '../Sesija.js';
import Ekstenzije from '../Ekstenzije.js';

const axios = require('axios');
const server = require('../../serverinfo.json').server;

class RangLista extends Component {
    constructor(props) {
        super(props);
        
        this.programIDs = [];
        this.brojac = 0;
        this.verzije = [];
        this.state = {
            grupe : this.props.grupe,
            odabranaGrupa : this.props.grupe != null ? this.props.grupe[0] : null,
            zavrseno : this.props.zavrseno,

            rangLista : null,
            zadaci : null,
            napomena : null
        }

        this.evaluirajPonovo = this.evaluirajPonovo.bind(this);
        this.ucitajRezultate = this.ucitajRezultate.bind(this);
        this.rangListaUpdate = this.rangListaUpdate.bind(this);
        this.upload = this.upload.bind(this);

        this.socket = io(server.ip + ':' + server.port);
        this.socket.on('RANG_LISTA', (data) => {
           this.povuciListu(data.verzija.takmicarskaGrupaId)
        });
    }

    
    componentWillMount() {
        this.povuciListu(this.state.odabranaGrupa.id);
       if (this.state.zavrseno == true)
           setInterval(this.ucitajRezultate, 5000);
    }

    takmGrupaUpdate(event) {
        var odabranaGrupa = null;
        this.props.grupe.map((grupa) => {
            if (grupa.id == event.target.value)
                odabranaGrupa = grupa;
        });

        this.setState({
            prikazi : false,
            odabranaGrupa : odabranaGrupa
        })
        this.povuciListu(event.target.value);
    }

    rangListaUpdate(e) {
        var value = e.target.value;
        axios.get('/ranglista', {
            params : {
                takmicarskaGrupaId : this.state.odabranaGrupa.id,
                vrsta : 'ucesnici',

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(lista => {
            if (value === '1') {
                axios.post('/rangListaUPdf', {
                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token,
                    zadaci : lista.data.zadaci,
                    lista : lista.data.data
                })
                .then(response => {
                    axios.get('/download',{
                        params : {
                            'fileName' : 'RangLista.pdf'
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
            }
            else {
                axios.post('/rangListaSaPodacimaUPdf', {
                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token,
                    zadaci : lista.data.zadaci,
                    lista : lista.data.data
                })
                .then(response => {
                    axios.get('/download',{
                        params : {
                            'fileName' : 'RangListaP.pdf'
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
            }
        })
    }

    povuciListu(id) {
        axios.get('/ranglista', {
            params : {
                takmicarskaGrupaId : id,
                vrsta : 'ucesnici',

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(lista => {
            this.setState({
                rangLista : lista.data.data,
                zadaci : lista.data.zadaci
            });
        })
    }

    evaluirajPonovo() {
        axios.get('/ucesnici', {
            params : {
                takmicarskeGrupeId : this.state.odabranaGrupa.id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            var ucesnici = [];
            var zadaci = [];
            if (response.data.success == 'yes') 
                ucesnici = response.data.data;
            axios.get('/zadaci', {
                params : {
                    takmicarskeGrupeId : this.state.odabranaGrupa.id,
                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token
                }
            })
            .then(response => {
                if (response.data.success == 'yes') {
                    zadaci = response.data.data;
                    this.najnovijeVerzije(ucesnici, zadaci);
                }
            })
            
        });
    }

    najnovijeVerzije(ucesnici, zadaci) {
        var verzije = [];
        for (let i = 0; i < ucesnici.length; i++) {
            for (let j = 0; j < zadaci.length; j++) {
                axios.get('/najnovijaVerzija', {
                    params : {
                        ucesnikId : ucesnici[i].id,
                        zadatakId : zadaci[j].id
                    }
                })
                .then(response => {
                    if (response.data.data != -1) {
                        verzije.push({
                            'ucesnikId' : ucesnici[i].id, 
                            'zadatakId' : zadaci[j].id,
                            'verzijaId' : response.data.verzijaId,
                            'novaVerzijaId' : response.data.novaVerzijaId,
                            'rjesenje' : response.data.rjesenje,
                            'jezik' : response.data.jezik
                        });
                    }
                    if (i == ucesnici.length - 1 && j == zadaci.length - 1) {
                        this.verzije = verzije;
                       setInterval( this.upload,5000);
                        this.brojac = verzije.length;
                    }
                });
            }
        }
    }

    upload() {
        if (this.verzije.length == 0) {
            clearInterval(this.upload);
            this.setState({
                napomena : "Postupak ponovne evaluacije je završen."
            });
            return;
        }
       /* let i = 0;
        for(let i = 0; i < verzije.length; i++) {
            let verzija = verzije[i];
            let zip = new JSZip();
            zip.file('ZADATAK' + Ekstenzije.getEkstenzija(verzija.jezik), verzija.rjesenje);
            zip.generateAsync({type : 'blob'}).then(zipBlob => {
                let formData = new FormData();
                formData.append('file', zipBlob);
                formData.append('id', verzija.novaVerzijaId);
                formData.append('zadatakId', verzija.zadatakId);
                formData.append('language', verzija.jezik);
                formData.append('korisnickoIme', Sesija.korisnik.korisnickoIme);
                formData.append('token', Sesija.korisnik.token);
                axios.post('/novaVerzija', formData)
                .then(response => {

                    this.programIDs.push({
                        'programId' : response.data.programId,
                        'jezik' : verzija.jezik,
                        'verzijaId' : verzija.novaVerzijaId,
                        'zadatakId' : verzija.zadatakId
                    });
                });
            });
        }*/
        let verzija = this.verzije[0];
        let zip = new JSZip();
        zip.file('ZADATAK' + Ekstenzije.getEkstenzija(verzija.jezik), verzija.rjesenje);
        zip.generateAsync({type : 'blob'}).then(zipBlob => {
            let formData = new FormData();
            formData.append('file', zipBlob);
            formData.append('id', verzija.novaVerzijaId);
            formData.append('zadatakId', verzija.zadatakId);
            formData.append('language', verzija.jezik);
            formData.append('korisnickoIme', Sesija.korisnik.korisnickoIme);
            formData.append('token', Sesija.korisnik.token);
            axios.post('/novaVerzija', formData)
            .then(response => {

                this.programIDs.push({
                    'programId' : response.data.programId,
                    'jezik' : verzija.jezik,
                    'verzijaId' : verzija.novaVerzijaId,
                    'zadatakId' : verzija.zadatakId
                });
                this.verzije.shift();
            });
        });
    }
        
    

    posaljiRjesenje(verzija) {
        return new Promise((resolve, reject) => { 
            setTimeout(() => {
                var zip = new JSZip();
            zip.file('ZADATAK' + Ekstenzije.getEkstenzija(verzija.jezik), verzija.rjesenje);
            zip.generateAsync({type : 'blob'}).then(zipBlob => {
                let formData = new FormData();
                formData.append('file', zipBlob);
                formData.append('id', verzija.novaVerzijaId);
                formData.append('zadatakId', verzija.zadatakId);
                formData.append('language', verzija.jezik);
                formData.append('korisnickoIme', Sesija.korisnik.korisnickoIme);
                formData.append('token', Sesija.korisnik.token);
                axios.post('/novaVerzija', formData)
                .then(response => {

                    this.programIDs.push({
                        'programId' : response.data.programId,
                        'jezik' : verzija.jezik,
                        'verzijaId' : verzija.novaVerzijaId,
                        'zadatakId' : verzija.zadatakId
                    });
                    resolve(this.programIDs);
                });
            });
            },10000);
        })
    }

    ucitajRezultate() {
        if (this.programIDs.length > 0) {
            let verzija = this.programIDs[0];
            console.log(verzija);
            axios.get('/getProgramStatus', {
                params : {
                    zadatakId : verzija.zadatakId,
                    id : verzija.programId,
                    verzijaId : verzija.verzijaId,
                    language : verzija.jezik
                }
            })
            .then(response => {
                if (response.data.success == 'yes') {
                    this.programIDs.shift();
                    this.brojac--;
                    if (this.brojac == 0) {
                        this.povuciListu(this.state.odabranaGrupa.id);
                        this.setState({
                            napomena : "Postupak ponovne evaluacije rješenja je završen."
                        });
                    }
                }
            });
        }
    }

    evaluacija() {
        this.evaluirajPonovo();
        this.setState({
            napomena : "Postupak ponovne evaluacije rješenja može potrajati. Molimo da budete strpljivi."
        });
    }
    
    render() {
       
        var grupe = this.state.grupe.map((grupa) => (
            <option value={grupa.id}>{grupa.naziv}</option>
        ));
        var naslovi = this.state.zadaci != null ? this.state.zadaci.map((zadatak) => (
            <th>{zadatak.redniBroj} - {zadatak.naslov}</th>
        )) : null;
        var ranglista = null;
        if (this.state.rangLista != null) {
            ranglista = this.state.rangLista != null ? this.state.rangLista.map((item, i) => (
                <tr id="cel">
                    <td>{i + 1}</td>
                    <td>{item.korisnickoIme}</td>
                    {this.props.zavrseno != 0 ?
                    <td>{item.ime + ' ' + item.prezime}</td>
                    :
                    null
                    }
                    {item.zadaci.map((zadatak, j) => (
                        <td>{zadatak.ukupno}</td>
                    ))}
                    <td>{item.ukupno}</td>
                </tr>
            )) : null;
        }
        

        return (
            
                <div>
                    <div>
                        <p className="naslov">Takmičarska grupa</p>
                        <select className="takmGrupa" onChange={this.takmGrupaUpdate.bind(this)}>{grupe}</select>
                    </div>
                    <div>
                        <p className="naslov">Rang lista</p>
                        <div className="nivo_3">
                            <p className="naslov">PDF Export</p>
                                <table style={{marginLeft: '2%', marginBottom : '2%'}}>
                                    <tbody>
                                        <tr>
                                            <td><input type="radio" name="vrsta" value="1" onClick={(e) => this.rangListaUpdate(e)}></input></td>
                                             <td><label for="1">Rang lista sa korisničkim imenima učesnika</label></td>
                                        </tr>
                                        <tr>
                                            <td><input type="radio" name="vrsta" value="2" onClick={(e) => this.rangListaUpdate(e)}></input></td>
                                            <td><label for="2">Rang lista sa podacima (ime i škola) učesnika</label></td>
                                        </tr>
                                    </tbody>
                                </table>
                            
                            <table>
                                <tbody>
                                    <tr id="cel">
                                        <th>Plasman</th>
                                        <th>Učesnik</th>
                                        {this.props.zavrseno != 0 ?
                                        <th>Ime i prezime</th>
                                        :
                                        null
                                        }
                                        {naslovi}
                                        <th>Ukupno</th>
                                    </tr>
                                        {ranglista}
                                </tbody>
                            </table>
                            {this.props.zavrseno == true ? <div className="buttons" style={{marginTop : '2%'}}><button onClick={(e) => this.evaluacija()}>Evaluiraj ponovo</button></div> : null }
                            {this.state.napomena != null ? <p className="napomena">{this.state.napomena}</p> : null}
                        </div>
                    </div>
                </div>
            
        );
    }
}

export default RangLista;