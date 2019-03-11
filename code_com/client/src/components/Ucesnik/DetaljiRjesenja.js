import React, { Component } from 'react';

import Sesija from '../Sesija.js';

var axios = require('axios');
var tumac = require('../Tumac.js');


class DetaljiRjesenja extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            id_rjesenje : this.props.match.params.id,
            ucesnikId : this.props.match.params.uId,
            zadatakId : this.props.match.params.zId,
            vrijeme : this.props.match.params.vrijeme,
            rjesenjeZadatka : null,
            autotestoviRezultati : null
        }
         this.povuciTacnoRjesenje(props);
        this.povuciTacnoRjesenje = this.povuciTacnoRjesenje.bind(this)
    }

    componentWillMount() {
        //this.povuciTacnoRjesenje()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            rjesenjeZadatka : null,
            autotestoviRezultati : null
        });
       this.povuciTacnoRjesenje(nextProps);
    }
    
    povuciTacnoRjesenje(props) {
        if (this.state.ucesnikId == null) {
            axios.get('/rjesenje', {
                params : {
                    id : props.match.params.id,

                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token
                }
            })
            .then(rjesenje => {
                if (rjesenje.data.success) {
                    this.setState({
                        rjesenjeZadatka : rjesenje.data
                    });
                }
            })
            .catch(err => {
                alert(err.toString())
            })
        }
        else {
            axios.get('/predaneVerzije', {
                params : {
                    ucesnikId : props.match.params.uId,
                    zadatakId : props.match.params.zId,
                    verzijaId : props.match.params.id,

                    korisnickoIme : Sesija.korisnik.korisnickoIme,
                    token : Sesija.korisnik.token
                }
            })
            .then(response => {
                var verzija = response.data.verzija;
                if (verzija != null && verzija.autotest_rezultati != null)  {
                    for (let i = 0; i < verzija.autotest_rezultati.length; i++) {
                        let at = verzija.autotest_rezultati[i];
                        
                        verzija.autotest_rezultati[i] =  { 
                            'status' : tumac.testTumac(at.status),
                            'izlaz' : at.output,
                            'run_status' : tumac.runTumac(at.runResult),
                            'compile_status' : tumac.compileTumac(at.compileResult),
                            'ulaz' : at.ulaz,
                            'ocekivaniIzlaz' : at.ocekivaniIzlaz,
                            'kod' : at.kod,
                            'global' : at.global
                        };
                    }
                 
                    this.setState({
                        autotestoviRezultati : verzija.autotest_rezultati
                    });
                }

            })
        }
    }

    prikaziAutotest(e) {
        console.log('prikaz_testa' + e.target.value)
        var div = document.getElementById('prikaz_testa' + e.target.value);
        div.classList.toggle('expanded');
        div.classList.toggle('collapsed');
    }

    render() {
        var autotestovi = [];
        if (this.state.autotestoviRezultati != null) {
           /* autotestovi = this.state.autotestoviRezultati.map((autotest, i) => (
                <div>
                    <table><tbody>
                        <tr id="cel">
                            <td colSpan='2'><p className="naslov">Autotest {(i + 1).toString()}</p></td>
                        </tr>
                        <tr id="cel">
                            <td><p className="naslov">Ulaz:</p></td>
                            <td>{autotest.ulaz}</td>
                        </tr>
                        <tr id="cel">
                            <td><p className="naslov">Očekivani izlaz:</p></td>
                            <td>{autotest.ocekivaniIzlaz}</td>
                        </tr>
                        <tr id="cel">
                            <td><p className="naslov">Dobijeni izlaz:</p></td>
                            <td>{autotest.izlaz}</td>
                        </tr>
                        <tr id="cel">
                            <td><p className="naslov">Status:</p></td>
                            <td>{autotest.status}</td>
                        </tr>
                    </tbody></table>
                </div>
            ));*/

            /*autotestovi = this.state.autotestoviRezultati.map((autotest, i) => (
                <tr id="cel">
                    <td>{(i+1).toString()}</td>
                    <td>{autotest.status}</td>
                    <td><a href="#">Detalji testa</a></td>
                </tr>
            ));*/

            autotestovi = this.state.autotestoviRezultati.map((autotest, i)=>(
                <li>
                    <table><tbody>
                        <tr id="cel">
                        <td>{(i+1).toString()}</td>
                    <td>{autotest.status == "Test je prošao." ? 
                        <i className="fa fa-check"></i>
                        :
                        <i className="fa fa-close"></i>
                        }</td>

                    <td><button style={{background : '#009973', border : '0', borderRadius : '12px', fontStyle : 'underline'}} value={i.toString()} onClick={this.prikaziAutotest.bind(this)}>Detalji testa</button></td>
                    </tr>
                    <tr  id="cel">
                        <td colSpan="3"><div className="container-verzije">
                        <div className="div-verzije" id={'prikaz_testa' + i.toString()}>
                            <table><tbody>
                                <tr>
                                    <td>Kod testa:</td>
                                    <td><textarea readOnly style={{whiteSpace : 'pre-line', width : '300px', height : '150px'}} value={autotest.kod}></textarea></td>
                                </tr>
                                <tr>
                                    <td>U globalnom opsegu:</td>
                                    <td><textarea readOnly style={{whiteSpace : 'pre-line', width : '300px', height : '50px'}} value={autotest.global}></textarea></td>
                                </tr>
                                <tr>
                                    <td>Ulaz: </td>
                                    <td><textarea readOnly style={{whiteSpace : 'pre-line', width : '300px', height : '35px', border : '0px'}} value={autotest.ulaz}></textarea></td>
                                </tr>
                                <tr>
                                    <td>Očekivani izlaz:</td>
                                    <td><textarea readOnly style={{whiteSpace : 'pre-line', width : '300px', height : '35px', border : '0px'}} value={autotest.ocekivaniIzlaz}></textarea></td>
                                </tr>
                                <tr>
                                    <td>Dobijeni izlaz:</td>
                                    <td><textarea readOnly style={{whiteSpace : 'pre-line', width : '300px', height : '35px', border : '0px'}} value={autotest.izlaz}></textarea></td>
                                </tr>
                                <tr>
                                    <td>Nalaz testa:</td>
                                    <td>{autotest.status}</td>
                                </tr>
                            </tbody></table>
                        </div>
                    </div></td>
                    </tr>
                    </tbody></table>
                </li>
            ));
        }
        return (

                <div style={{background: 'white', opacity : '0.9', margin : '3%', padding : '1em', borderRadius : '12px', overflowY : 'scroll', height : '60vh'}}>
                    <p className="naslov">Detalji rješenja</p>
                    <div className="nivo_2">
                       
                        {this.state.rjesenjeZadatka != null ?
                        <div>
                            <div>
                            <p className="naslov">Rješenje zadatka</p>
                            <div className="nivo_3">
                                <textarea readOnly style={{width : '90%', height : '300px', background : 'white'}}>{this.state.rjesenjeZadatka.rjesenje}</textarea>
                            </div>
                            </div>
                            <div >
                                <p className="naslov">Rezultat kompajliranja:</p>

                            <div className="nivo_3">
                                <p style={{background : 'white', width : '90%', border : '1px solid #009973', height : '20%', padding : '1em', textAlign : 'left', borderRadius : '12px'}}>{this.state.rjesenjeZadatka.compileOutput}</p>
                            </div>
                            </div>
                        </div> : 
                        <div>
                            <p className="naslov">Rezultati testiranja</p>
                            <div className="nivo_3">
                               <ul>
                                   {autotestovi}
                                </ul>
                            </div>
                        </div>}
                    </div>
                </div>

        );
    }
}

export default DetaljiRjesenja;