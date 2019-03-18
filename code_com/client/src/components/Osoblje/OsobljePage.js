import React, { Component } from 'react';

import '../../css/common.css'

//import Takmicenja from './Takmicenja.js';
import Pocetna from './Pocetna.js';
import ZavrsenaTakmicenja from './ZavrsenaTakmicenja';
import PrivateRoute from '../PrivateRoute';


/* ----- zbog osvježavanja stranice */
import DetaljiTakmicenja from './DetaljiTakmicenja.js';


import { 
    BrowserRouter as Router, 
    Route, 
    Redirect,
    Link ,
    Switch
} from 'react-router-dom';



class OsobljePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id : this.props.idAdmina
        }
    }

    logout() {
        this.props.onLogout();
    }

   render() {
       const pocetna = () => <Pocetna idAdmina={this.state.id} history={this.props.history}/>
       const zavrsena= () => <ZavrsenaTakmicenja idAdmina={this.state.id}/>
       const detaljiTakmicenja = () => <DetaljiTakmicenja  id={localStorage.getItem('takmicenjeId')} idAdmina={this.state.id}/>
      // const takmicenja = () => <Takmicenja/>;
       return (
        <Router history={this.props.history}>
            <div className="OsobljePage">
                <div className="menu">
                   <ul style={{height : '100%'}}>
                        <li><h2>code.com</h2></li>
                        <li>
                            <Link to='/admin_takmicenja/pocetna'>
                                <button className="menuButton">Aktivna takmičenja</button>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin_takmicenja/takmicenja">
                                <button className="menuButton">Završena takmičenja</button>
                            </Link>
                        </li>
                        <li style={{borderTop : '1px solid white'}}>
                            <button className="menuButton" onClick={this.logout.bind(this)}>Odjava sa sistema</button>
                        </li>
                    </ul>
                </div>
                <div className="container"> 
                <Switch>
                    <PrivateRoute info='admin_takmicenja' exact path='/admin_takmicenja/pocetna' component={pocetna}></PrivateRoute>
                    <PrivateRoute info='admin_takmicenja' exact path='/admin_takmicenja/pocetna/detalji' component={detaljiTakmicenja}></PrivateRoute>
                    <PrivateRoute info='admin_takmicenja' exact path='/admin_takmicenja/takmicenja' component={zavrsena}/>
                    <Redirect from='/admin_takmicenja/*' to="/admin_takmicenja/pocetna"/>
                </Switch>
                </div>
            </div> 
        </Router>

    );
   }
}


export default OsobljePage;