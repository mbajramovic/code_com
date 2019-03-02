// stranica o detaljima takmičenja za osoblje (administratora takmičenja)

import React, { Component } from 'react';
import io from 'socket.io-client';

import '../../css/common.css';
import '../../css/OsobljePage.css';
import '../../css/UcesnikPage.css';

import Ucesnici from './Ucesnici/Ucesnici.js';
import Autotestovi from './Autotestovi.js';
import LiveTakmicenje from './LiveTakmicenje.js';
import RangLista from './RangLista.js';
import ProsirenaRangLista from './ProsirenaRangLista.js';
import Pitanja from './Pitanja.js';
import Sat from '../Sat.js';


import OsnovneInformacije from './Takmicenje/OsnovneInformacije.js';
import Pravila from './Takmicenje/Pravila.js'; 
import Zadaci from './Takmicenje/Zadaci.js';

import Sesija from '../Sesija.js';

import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link
} from 'react-router-dom';

const axios = require('axios');
const server = require('../../serverinfo.json').server;




// prikaz opcija za detalje nekog takmicenja (info, pravila, zadaci, ucesnici)
class PregledTakmicenja extends Component {
    constructor(props) {
        super(props);

        this.state = {
            target : null,
            takmicenjeInfo : null,
            takmicarskeGrupe : null,
            otvoriTakmicenje : false,
            vrijeme : {
                'sati' : 0,
                'minute' : 0,
                'sekunde' : 0
            },
            error : null,
            poruka : null,

            brojNovihPitanja : -1
        }

        this.povuciTakmicenje = this.povuciTakmicenje.bind(this);

        this.socket = io(server.ip + ':' + server.port);
        this.socket.on('NOVO_PITANJE_PREGLED', (data) => {
            this.setState({
                brojNovihPitanja : data
            });
        });
        this.socket.on('NOVI_ODGOVOR_PREGLED', (data) => {
            var br = this.state.brojNovihPitanja;
            this.setState({
                brojNovihPitanja : br - 1
            });
        });


    }

    componentWillMount() {
        this.povuciTakmicenje();
    }

    oznaci(event) {
        if (this.state.target != null) {
            this.state.target.style.borderLeft = 'none';
            this.state.target.style.color = 'gray';
        }
        event.target.style.borderLeft = '4px solid #009973';
        event.target.style.color = 'black';

        this.setState ({
            target : event.target
        });

        if (event.target.id == '0' || event.target.id == '1') {
            var ind = this.state.otvoriTakmicenje;
            this.setState({otvoriTakmicenje : !ind});
        }
        else {
            this.setState({otvoriTakmicenje : false, error : null});
        }
        
    }

    povuciTakmicenje() {
        axios.get('/takmicenje', {
            params : {
                'id' : this.props.id,
                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success) {
                
                let vrijeme = {'sati' : this.state.vrijeme.sati, 'minute' : this.state.vrijeme.minute, 'sekunde' : (new Date(response.data.takmicenje.trajanje) - new Date())/1000};
                
                this.setState({
                    takmicenjeInfo : response.data.takmicenje,
                    takmicarskeGrupe : response.data.takmicarskeGrupe,
                    vrijeme : vrijeme,
                    brojNovihPitanja : response.data.brojPitanja
                });

                localStorage.setItem('takmicenjeInfo', this.state.takmicenjeInfo)
            }
            else {
                // ?
            }
        })
        .catch(error => {
            // ?
        });
    }

    updateSati(event) {
        let vrijeme = {'sati' : event.target.value, 'minute' : this.state.vrijeme.minute, 'sekunde' : this.state.vrijeme.sekunde}
        this.setState({
            vrijeme : vrijeme
        });
    }

    updateMinute(event) {
        let vrijeme = {'sati' : this.state.vrijeme.sati, 'minute' : event.target.value, 'sekunde' : this.state.vrijeme.sekunde}
        this.setState({
            vrijeme : vrijeme
        });
    }

    otvoriTakmicenje() {
        axios.post('/otvoriTakmicenje', {
            id : this.props.id,
            vrijeme : this.state.vrijeme,

            korisnickoIme : Sesija.korisnik.korisnickoIme,
            token : Sesija.korisnik.token
        })
        .then(response => {
            if (response.data.success) {
                this.setState({ 
                    poruka : 'Takmičenje je otvoreno!',
                    vrijeme : {
                        'sekunde' : response.data.sekunde
                    }});
            }
            else {
                this.setState({error : response.data.data});
            }
        })
        .catch(error => {
            this.setState({error : error.toString()});
        })
    }

    render() {
        //alert(this.state.takmicarskeGrupe.length);
        const osnovneInformacije = () => <OsnovneInformacije informacije={this.state.takmicenjeInfo}/>;
        const pravila = () => <Pravila grupe={this.state.takmicarskeGrupe} vrsta={this.state.takmicenjeInfo.vrsta} jezik={this.state.takmicenjeInfo.programskiJezik}/>;
        const zadaci = () => <Zadaci grupe={this.state.takmicarskeGrupe} adminId={this.props.idAdmina}  zavrseno={this.state.takmicenjeInfo.zavrseno}/>;
        const ucesnici = () => <Ucesnici grupe={this.state.takmicarskeGrupe} adminId={this.props.idAdmina} takmId={this.props.id} zavrseno={this.state.takmicenjeInfo.zavrseno} history={this.props.history}/>
        const liveTakmicenje = () => <LiveTakmicenje grupe={this.state.takmicarskeGrupe}/>
        const rangLista = () => <RangLista grupe={this.state.takmicarskeGrupe} zavrseno={this.state.takmicenjeInfo.zavrseno}/>
        const prosirenaRangLista = () => <ProsirenaRangLista grupe={this.state.takmicarskeGrupe} takmicenjeId={this.state.takmicenjeInfo.id}/>
        const autotestovi = () => <Autotestovi takmicenjeId={this.props.id}/>
        const pitanja = () => <Pitanja idTakmicenja={this.props.id} />
        //if(this.state.takmicenjeInfo)alert(this.state.takmicenjeInfo.zavrseno)
        return (
            <Router>
                <div>
                <div className="infomenu">
                    <ul className="containermenu">
                        <li>
                            <Link to={`/admin_takmicenja/detalji/${ this.props.id }/info`}>
                                <button onClick={this.oznaci.bind(this)}>Osnovne informacije</button>
                            </Link>
                        </li>
                        <li>
                            <Link to={`/admin_takmicenja/detalji/${ this.props.id }/pravila`}>
                                <button onClick={this.oznaci.bind(this)}>Pravila</button>
                            </Link>
                        </li>
                        <li>
                            <Link to={`/admin_takmicenja/detalji/${ this.props.id }/zadaci`}>
                                <button onClick={this.oznaci.bind(this)}>Zadaci</button>
                            </Link>
                        </li>
                        <li>
                            <Link to={`/admin_takmicenja/detalji/ucesnici`}>
                                <button onClick={this.oznaci.bind(this)}>Učesnici</button>
                            </Link>
                        </li>
                        {(this.state.takmicenjeInfo && this.state.takmicenjeInfo.zavrseno) ?
                        <div>
                             <li style={{borderTop : '1px solid #009973', marginTop : '5%'}}> 
                                    <Link to={`/admin_takmicenja/detalji/${ this.props.id }/live`}>
                                        <button  onClick={this.oznaci.bind(this)}>Predane verzije</button>
                                    </Link>
                                </li>
                            <li>
                                <Link to=''> 
                                    <button id='1' onClick={this.oznaci.bind(this)}>Reaktiviraj takmičenje</button>
                                </Link>
                            </li>
                            <li>
                                <Link  to={`/admin_takmicenja/detalji/${ this.props.id }/autotestovi`}>
                                    <button  onClick={this.oznaci.bind(this)}>Ažuriraj autotestove</button>
                                </Link> 
                            </li>
                            <li >
                                <Link to={`/admin_takmicenja/detalji/${ this.props.id }/${1}/ranglista`}>
                                    <button onClick={this.oznaci.bind(this)}>Rang lista učesnika</button>
                                </Link>
                            </li> 
                            <li>
                                <Link to={`/admin_takmicenja/detalji/${ this.props.id }/prosirenaRangLista`}> 
                                    <button onClick={this.oznaci.bind(this)}>Rang lista po ostalim kriterijima</button>
                                </Link>
                            </li>

                        </div>:
                        <div>
                        {(this.state.takmicenjeInfo && !this.state.takmicenjeInfo.aktivno) ?
                            <li>
                                <Link to=''>
                                    <button id="0" onClick={this.oznaci.bind(this)}>Otvori takmičenje</button>
                                </Link>
                            </li> : 
                            <div>

                                <li style={{borderTop : '1px solid #009973', marginTop : '5%'}}> 
                                    <Link to={`/admin_takmicenja/detalji/${ this.props.id }/live`}>
                                        <button  onClick={this.oznaci.bind(this)}>Predane verzije</button>
                                    </Link>
                                </li>
                                <li>
                                    <Link to={`/admin_takmicenja/detalji/${ this.props.id }/${0}/ranglista`}>
                                        <button onClick={this.oznaci.bind(this)}>Rang lista</button>
                                    </Link>
                                </li>
                                <li>
                                    <Link to={`/admin_takmicenja/detalji/${ this.props.id }/pitanja`}>
                                    {this.state.brojNovihPitanja == -1 ?
                                        <button onClick={this.oznaci.bind(this)}>Pitanja</button>
                                    : <button onClick={this.oznaci.bind(this)}>Pitanja ({this.state.brojNovihPitanja})</button>}
                                    </Link>
                                </li>
                                <li style={{borderTop : '1px solid #009973'}}>
                                    <button>Vrijeme</button>
                                </li>
                            </div>                        
                        }
                        </div>
                        }
                        {this.state.vrijeme.sekunde > 0 ?
                            <li>
                                <Sat sekunde={this.state.vrijeme.sekunde} takmicenjeId={this.state.takmicenjeInfo.id}/>
                            </li>
                            : null
                        }
                    </ul>
                </div>
                <div className="infocontainer">
                    <Route path='/admin_takmicenja/detalji/:id/info' component={osnovneInformacije}></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/pravila' component={pravila} ></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/zadaci' component={zadaci}></Route>
                    <Route exact path='/admin_takmicenja/detalji/ucesnici' component={ucesnici}></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/live' component={liveTakmicenje}></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/:zavrseno/ranglista' component={rangLista}></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/prosirenaRangLista' component={prosirenaRangLista}></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/pitanja' component={pitanja}></Route>
                    <Route exact path='/admin_takmicenja/detalji/:id/autotestovi' component={autotestovi}></Route>


                    {this.state.otvoriTakmicenje ?
                    <div>
                        {this.state.error ? 
                        <div>
                            <p className="greska">{this.state.error}</p>
                        </div> :
                        <div>
                        {this.state.poruka ? 
                        <div>
                            <p className="uspjeh">{this.state.poruka}</p>
                        </div>
                        : <div>
                        <p className="naslov">Aktiviranje takmičenja</p>
                        <div className="nivo_2">
                        <p className="napomena">Potrebno je unijeti vremensko trajanje takmičenja. Nakon isteka unesenog vremena bit će zabranjeno dalje predavanje novih rješenja. Prije otvaranja takmičenja, potrebno je da svi zadaci imaju definisane autotestove.</p>
                        <table><tbody>
                            <tr>
                                <td>Trajanje:</td>
                                <td><input type="number" placeholder="Sati" onChange={this.updateSati.bind(this)}/></td>
                                <td><input type="number" placeholder="Minute" onChange={this.updateMinute.bind(this)}/></td>
                            </tr>
                            <tr>
                                <td colSpan="3">
                                    <div className="buttons">
                                        <button onClick={this.otvoriTakmicenje.bind(this)}>POTVRDI</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody></table>
                        </div>
                        </div> }
                        </div> }
                    </div> : null}
                </div>
                </div>
                </Router>
        )
    }
}


class DetaljiTakmicenja extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            id : localStorage.getItem('takmicenjeId'),
            admin :localStorage.getItem('adminId')
        }

    }

  

    render() { 
        return ( 
            <div>
                <PregledTakmicenja id={this.state.id} idAdmina={this.state.admin} history={this.props.history}/>
            </div>
        );
    }

}

export default DetaljiTakmicenja;