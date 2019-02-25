// stranica za administratora sistema 


import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import registerServiceWorker from '../../registerServiceWorker';

import styles from  '../../css/AdminPage.css';
import '../../css/common.css';

import Takmicenje from './Takmicenje.js';
import Osoblje from './Osoblje.js';
import PregledTakmicenja from './PregledTakmicenja.js';


class AdminPage extends Component {
    
    constructor(props) {
        var menu_opcije_local = [];
        super(props);
        menu_opcije_local.push(
            <div className="AdminPage">
                <div className="menu">
                    <ul>
                        <li><h2>code.com</h2></li>
                        <li onMouseLeave={() => this.sakrijOpcije(0)}>
                            <button className="menuButton" onMouseOver={() => this.prikaziOpcije(0)}>Takmičenja</button>
                            <ul className="menuZaTakmicenje">
                                <li><button className="podmenuButton" onClick={() => this.izbor(0)}>Novo takmičenje</button></li>
                                <li><button className="podmenuButton" onClick={() => this.izbor(2)}>Pregled takmičenja</button></li>
                            </ul>
                        </li>
                        <li onMouseLeave={() => this.sakrijOpcije(1)}>
                            <button className="menuButton" onMouseOver={() => this.prikaziOpcije(1)}>Osoblje</button>
                            <ul className="menuZaOsoblje">
                                <li><button className="podmenuButton" onClick={() => this.izbor(1)}>Novi administrator takmičenja</button></li>
                                <li><button className="podmenuButton">Pregled registrovanog osoblja</button></li>
                            </ul>
                        </li>
                        <li style={{borderTop : '1px solid white'}}> 
                            <button className="menuButton" onClick={this.logout.bind(this)}>Odjava sa sistema</button>
                        </li>
                    </ul>
                </div>
                <div className="container">
                </div>
            </div>
        );

        var prikaz_opcija_local = [];
        var prikaz_podopcija_local = [];

        prikaz_opcija_local.push(<Takmicenje />);
        prikaz_opcija_local.push(<Osoblje />);
        prikaz_opcija_local.push(<PregledTakmicenja />);
        

        prikaz_podopcija_local.push('menuZaTakmicenje');
        prikaz_podopcija_local.push('menuZaOsoblje');

        this.state = {
            menu_opcije : menu_opcije_local,
            prikaz_opcija : prikaz_opcija_local,
            prikaz_podopcija : prikaz_podopcija_local
        };
    }

    izbor(i) {
        ReactDOM.render(this.state.prikaz_opcija[i], document.getElementsByClassName('container')[0]);
        registerServiceWorker();
        
    }

    prikaziOpcije(i) {
        document.getElementsByClassName(this.state.prikaz_podopcija[i])[0].style.display = 'block';
    }

    sakrijOpcije(i) {
        document.getElementsByClassName(this.state.prikaz_podopcija[i])[0].style.display = 'none';
    }

    logout() {

        this.props.onLogout();
    }

    render() {
        return (
            <div className="AdminPage">
               {this.state.menu_opcije}
            </div>
        );
    }

}

class Pomocna extends Component{
    constructor(props) {
        super(props);
        this.state = {
            odabranaOpcija : global,
        }
    }
    render() {        
        return (
            <div className="AdminPage">
                <AdminPage onLogout={this.props.onLogout} odabrana_opcija={this.state.odabranaOpcija} />
            </div>
        )
    }
}


export default Pomocna;