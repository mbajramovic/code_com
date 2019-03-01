import React, { Component } from 'react';
import JSZip from 'jszip';
import io from 'socket.io-client';

import DetaljiRjesenja from './DetaljiRjesenja.js';
import Sesija from '../Sesija.js';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

var tumac = require('../Tumac.js');
var ekstenzije = require('../Ekstenzije.js');

const axios = require('axios');
const server = require('../../serverinfo.json').server;

class PredaneVerzije extends Component {
    constructor(props) {
        super(props);

        this.odabraniJezik = null;
        
        this.state =  {
            dodaniZadatak : [],
            id : this.props.match.params.id,
            ucesnikId : this.props.match.params.ucesnikId,
            takmicenjeId : this.props.match.params.takmicenjeId,
            verzije : [],
            programIDs : [],
            
            programskiJezik : '',
            ekstenzija : ''
        }
       
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.ucitajRezultate = this.ucitajRezultate.bind(this); 
        this.povuciVerzije = this.povuciVerzije.bind(this);
        this.povuciJezike = this.povuciJezike.bind(this);

        //this.povuciVerzije();
        
        this.socket = io(server.ip + ':' + server.port);
        this.obavijestiAdministratora = data => {
            this.socket.emit('OBAVIJESTI_ADMINISTRATORE', {
                verzija : data
            });
        }

       
    }

    handleUploadFile(event) {
        var fajl = [];
        fajl.push(event.target.files[0])
        this.setState({dodaniZadatak : fajl});
    }

    componentDidMount() {
        this.povuciTip();
        this.povuciJezike();
        setInterval(this.ucitajRezultate, 10000);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            id : nextProps.match.params.id,
            ucesnikId : nextProps.match.params.ucesnikId,
        });
        this.povuciTip();
        this.povuciVerzije();
        this.povuciJezike();
    }

    jezikUpdate(e) {
        this.odabraniJezik = e.target.value;  
    }

    uploadFile() {
        let fd = new FormData();
        fd.append('file', this.state.dodaniZadatak[0]);
        fd.append('zadatakId', this.state.id);
        fd.append('ucesnikId', this.state.ucesnikId);
        fd.append('korisnickoIme', Sesija.korisnik.korisnickoIme);
        fd.append('token', Sesija.korisnik.token);
        axios.post('/rjesenje', fd)
        .then(response => {
            var zip = new JSZip();  
            zip.file('ZADATAK' + ekstenzije.getEkstenzija(this.odabraniJezik), response.data.rjesenje);  
            zip.generateAsync({type: "blob"}).then(zipBlob => {  
            let _fd = new FormData();
            _fd.append('file', zipBlob);
            _fd.append('id', response.data.id);
            _fd.append('zadatakId', this.state.id);
            _fd.append('language', this.odabraniJezik);
            _fd.append('korisnickoIme', Sesija.korisnik.korisnickoIme);
            _fd.append('token', Sesija.korisnik.token);
            axios.post('/novaVerzija', _fd)
            .then(_response => {
                if (_response.data.success) {
                    var verzija = {};
                    verzija.id = response.data.id,
                    verzija.vrijeme = _response.data.vrijeme,
                    verzija.rjesenje = response.data.rjesenje;
                    verzija.status = 'Molimo da sačekate...';
                    var verzije = this.state.verzije;
                    var programIDs = this.state.programIDs;
                    var programInfo = {'programId' : _response.data.programId, 'indeksVerzije' : verzije.length, 'language' : this.odabraniJezik};
                    programIDs.push(programInfo);
                    verzije.push(verzija);
                    this.setState({ verzije : verzije, programIDs : programIDs });
                }
            })
            .catch(error => {
                this.setState({error : error.message});
            });
        })
        .catch(error => {
            this.setState({error : error.message});
        });
        })
        .catch(error => {
            this.setState({error : error.message});
        })
    }

    povuciVerzije() {
        axios.get('/predaneVerzije', {
            params : {
                ucesnikId : this.state.ucesnikId,
                zadatakId : this.state.id,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        }) 
        .then(response => {
            if (response.data.success) {
                var verzije = response.data.verzije;
                for (let i = 0; i < verzije.length; i++) {
                    verzije[i].status = tumac.compileTumac(verzije[i].status);
                   
                    for (let j = 0; j < verzije[i].autotest_rezultati.length; j++) {
                        let at = verzije[i].autotest_rezultati[j];
                        verzije[i].autotest_rezultati[j] = {
                            'status' : tumac.testTumac(at.status),
                            'izlaz' : at.output,
                            'run_status' : tumac.runTumac(at.runResult),
                            'compile_status' : tumac.compileTumac(at.compileResult),
                            'ulaz' : at.ulaz,
                            'ocekivaniIzlaz' : at.ocekivaniIzlaz
                        };
                    }
                    if (i == verzije.length - 1) {
                        var netestiraneVerzije = response.data.netestiraneVerzije;
                        var programIDs = [];
                        for (let j = 0; j < netestiraneVerzije.length; j++) {
                            programIDs.push({'programId' : netestiraneVerzije[j].programId, 'indeksVerzije' : verzije.length});
                            var verzija = {
                                'id' : netestiraneVerzije[j].id,
                                'vrijeme' : netestiraneVerzije[j].createdAt,
                                'rjesenje' : netestiraneVerzije[j].rjesenje,
                                'status' : 'Molimo da sačekate...'
                            }
                            verzije.push(verzija);
                        }
                        this.setState({ verzije : verzije, programIDs : programIDs});
                        break;
                    }
                }
            }
        })
        .catch(error => {
            this.setState({error : error.message});
        })
      
    }

    ucitajRezultate() {
        if (this.state.programIDs.length > 0) {
            axios.get('/getProgramStatus', {
                params : {
                    zadatakId : this.state.id,
                    id : this.state.programIDs[0].programId,
                    verzijaId : this.state.verzije[this.state.programIDs[0].indeksVerzije].id,
                    language : this.state.programIDs[0].language
                }
            })
            .then(response => {
                if (response.data.success) {
                    var verzija = this.state.verzije[this.state.programIDs[0].indeksVerzije];
                    if (response.data.success == 'yes') {
                        var zadatakId = -1;
                        verzija.autotest_rezultati = [];
                        var rezultati = response.data.autotestovi;
                        var glavniRezultat = response.data.rezultat;
                        verzija.status = tumac.glavniTumac(glavniRezultat.status);
                        verzija.compile_status = tumac.compileTumac(glavniRezultat.compile_result.status);
                        var atRez = [];
                        for (var i = 0; i < rezultati.length; i++) {
                            var autotest = {'status' : tumac.testTumac(rezultati[i].status), 'izlaz' : rezultati[i].run_result.output, 
                                            'run_status' : tumac.runTumac(rezultati[i].run_result.status),
                                            'compile_status' : tumac.compileTumac(rezultati[i].compile_result.status),
                                            'ulaz' : rezultati[i].ulaz,
                                            'ocekivaniIzlaz' : rezultati[i].ocekivaniIzlaz
                                         };
                          
                            verzija.autotest_rezultati.push(autotest);
                        }
                        //verzija.autotest_rezultati = atRez;
                        //console.log(verzija);
                        verzija.zadatakId = this.state.id;
                        verzija.ucesnikId = this.state.ucesnikId;
                        verzija.takmicenjeId = rezultati.takmicenjeId;
                        verzija.takmicarskaGrupaId = glavniRezultat.takmicarskaGrupaId;
                        this.obavijestiAdministratora(verzija);                        
                        var verzije = this.state.verzije;
                        verzije[this.state.programIDs[0].indeksVerzije] = verzija;
                        this.state.programIDs.shift();
                        this.setState({verzije : verzije});
                    }
                   
                    else {
                        verzija.status = response.data.data;
                        var verzije = this.state.verzije;
                        verzije[this.state.programIDs[0].indeksVerzije] = verzija;
                        this.setState({ verzije : verzije});
                    }
                }
                else {
                    alert(response.data.data);
                    this.setState({error : response.data.data});
                }
            })
            .catch(error => {
                this.setState({error : error.message});
            })
        }
    }
        
    // tip datoteke koji se moze predavati kao rjesenje
    povuciTip() {
        axios.get('/ekstenzija', {
            params : {
                id : this.state.takmicenjeId
            }
        })
        .then(response => {
            if (response.data.success)
                this.setState({
                    programskiJezik : response.data.data.programskiJezik,
                    ekstenzija : response.data.data.tipDatoteke
                });
                this.povuciVerzije();
        })
        .catch(error => {
            this.setState({
                error : error
            })
        });
    }

    povuciJezike() {
        axios.get('/jeziciZaZadatak', {
            params : {
                zadatakId : this.state.id
            }
        })
        .then(response => {
            if (response.data.success) {
                var jezici = response.data.data;
                this.setState({
                    jezici : jezici
                });
                this.odabraniJezik = jezici.length != 0 ? jezici[0] : null;
            }
        })
        .catch(error => {
            this.setState({error : error});
        });
    }

    updateVerzija(event) {
        
        var div = document.getElementById(event.target.name);
        div.classList.toggle('expanded');
        div.classList.toggle('collapsed');
    }

    prikaziDetalje(e) {

        document.getElementById("mySidenav").style.width = "60%";
    }

    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    render() {
       // alert(this.props.programskiJezik); 
        const verzije = this.state.verzije.map((verzija, i) => (
           <tr>
               <td>{(i + 1).toString()}</td>
               <td>{verzija.vrijeme}</td>

               <td>
                   <Link to={`/detalji/rjesenje/${verzija.vrijeme}/${verzija.id}`}>
                        <a href="#" onClick={this.prikaziDetalje.bind(this)}>Rjesenje br. {i + 1}</a>
                    </Link>
                </td>
                <td>{verzija.status }  
                    <Link to={`/detalji/rjesenje/${verzija.vrijeme}/${verzija.id}`}>
                        <a href="#" onClick={this.prikaziDetalje.bind(this)}> Detalji</a>
                    </Link>
                </td>
                <td>
                    <Link to={`/detalji/autotestovi/${verzija.vrijeme}/${verzija.id}/${this.state.id}/${this.state.ucesnikId}`}>
                        <a href="#" onClick={this.prikaziDetalje.bind(this)}>Rezultati testiranja</a>
                    </Link>
                </td>
            </tr>
        )); 
        const jezici = this.state.jezici != null ? this.state.jezici.map((jezik, i) => (
            <option value={jezik}>{jezik} (ekstenzija: {ekstenzije.getEkstenzija(jezik)})</option>
        )) : null;

        return(
            <Router>
                <div>
                    <div>
                        <p className="naslov">Nova verzija rješenja</p>
                        <div className="nivo_3">
                            <p className="napomena">Potrebno je izabrati programski jezik, a zatim datoteku sa računara sa odgovarajućom ekstenzijom.<br/></p>
                                <form>
                                <select onChange={(e) => this.jezikUpdate(e)} style={{marginRight : '2%'}}>
                                    {jezici}
                                </select>
                                    <input type="file"  onChange={this.handleUploadFile}/></form>
                                <div className="buttons">
                                    <button onClick={this.uploadFile.bind(this)}>Predaj verziju</button>
                                </div>
                                <div>
                                    {
                                        this.state.error != null ?
                                            <p className="greska">{this.state.error} Molimo pokušajte opet.</p> : null
                                    }
                                </div>
                        </div>
                        <p className="naslov">Predane verzije</p>
                        <div className="nivo_3" id="verzije" style={{textAlign : 'center'}}>
                        <p className="napomena"></p>
                        <table>
                            <tbody>
                                <tr id="cel">
                                    <th>Red. broj</th>
                                    <th>Vrijeme predaje</th>
                                    <th>Rješenje</th>
                                    <th>Status</th>
                                    <th>Rezultati testiranja</th>
                                </tr>
                                {verzije}
                            </tbody>
                        </table>
                        </div>
                    </div>     
                    <div className="sidenav" id="mySidenav">
                        <div style={{ margin: '3%', marginBottom : '0', textAlign : 'left'}}>
                            <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav.bind(this)}>&times;</a>
                        </div>
                         <Route exact path="/detalji/rjesenje/:vrijeme/:id" component={DetaljiRjesenja}></Route>
                         <Route exact path="/detalji/autotestovi/:vrijeme/:id/:zId/:uId" component={DetaljiRjesenja}></Route>
                    </div>       
                </div>
            </Router>
        );
    }


    /*render() {
        //alert(this.state.programIDs.length);
        const verzije = this.state.verzije.map((verzija, i) => (
            <div>
                <button className="button-verzije" name={i.toString()} onClick={this.updateVerzija.bind(this)}>Verzija {verzija.vrijeme}</button>
                <div className="container-verzije">
                    <div className="div-verzije" id={i.toString()}>
                        <table  style={{width : '100%', height :'50%'}}><tbody>
                            <tr>
                                <td><p className="naslov">Rješenje</p></td>
                                <td><p className="naslov">Rezultati</p></td>
                            </tr>
                            <tr>
                                <td><textarea readOnly style={{width : '250px', height : '200px'}}>{verzija.rjesenje}</textarea></td>
                                <td>
                                    <table style={{border : '1px solid #009973', borderRadius : '12px', marginLeft : '5%'}}><tbody>
                                        <tr><td></td><td><p className="obavjestenje">{verzija.status}</p></td></tr>
                                        <tr><td></td><td>{verzija.compile_status}</td></tr>
                                        {verzija.autotest_rezultati != null ? 
                                            verzija.autotest_rezultati.map((at, j) => (
                                                <tr style={{border: '1px solid #009973'}}>
                                                    <td>AT {j}.</td>
                                                    <td>{at.status}</td>
                                                </tr>
                                            )) : null}
                                    </tbody></table>
                                </td>
                            </tr>
                        </tbody></table>
                    </div>
                </div>
            </div>
        ));
        return(
            <div>
                <div>
                    <button className="button-verzije" style={{marginTop : '5%'}} name="nova" onClick={this.updateVerzija.bind(this)}>Nova verzija</button>
                    <div className="container-verzije">
                        <div className="div-verzije" id="nova">
                            <form><input type="file" onChange={this.handleUploadFile}/></form>
                            <div className="buttons">
                                <button onClick={this.uploadFile.bind(this)}>Predaj verziju</button>
                            </div>
                        </div>
                    </div>
                </div>
                {verzije}
            </div>
        )
    }*/
}


export default PredaneVerzije;