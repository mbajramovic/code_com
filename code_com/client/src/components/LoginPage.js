import React, { Component } from 'react';
import styles from './../css/LoginPage.css';

const axios = require('axios');

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            korisnickoIme : '',
            lozinka : '',
        };

        this.login = this.login.bind(this);
        this.korisnickoImeUpdate = this.korisnickoImeUpdate.bind(this);
        this.lozinkaUpdate = this.lozinkaUpdate.bind(this);
    }

    login() {
        this.props.onLogin(this.state);
    }

    korisnickoImeUpdate(event) {
        this.setState({
            korisnickoIme : event.target.value
        });
    }

    lozinkaUpdate(event) {
        this.setState({
            lozinka : event.target.value
        })
    }
    
    render() {
        return (
            <div className="LoginPage">
                <div className="grid">
                    <div className="sredina">
                        <div className="firstcol">
                            <p className="tekst" style={{color : 'green', textAlign : 'center', fontSize : '30px'}}>DOBRODOŠLI</p>
                        </div>
                        <div className="secondcol">
                            <div className="lijeviDiv">
                                <h2 className={styles.appname}>code.com</h2>
                                {this.props.poruka != null ? <h3 className="greska">Greška: {this.props.poruka}</h3> : null}
                                <input className={styles.logininput} type="text" placeholder="Korisničko ime" onChange={this.korisnickoImeUpdate}/>
                                <input className={styles.logininput} type="password" placeholder="Lozinka" onChange={this.lozinkaUpdate}/>
                                <button className="loginButton" onClick={this.login}>PRIJAVITE SE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;