import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import logo from './logo.svg';
import styles from './css/App.css';

import PrivateRoute from './components/PrivateRoute.js';
import AdminPage from './components/Admin/AdminPage.js';
import LoginPage from './components/LoginPage.js';
import OsobljePage from './components/Osoblje/OsobljePage';
import UcesnikPage from './components/Ucesnik/UcesnikPage';

import Sesija from './components/Sesija.js';

import history from './components/History.js';

const axios = require('axios');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginPage : [],
      rola : '',
      poruka : null,
      id : null,
      korisnik : null
    };

    this.loginKorisnika = this.loginKorisnika.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.setItem('rola', '');
    localStorage.removeItem('id');
    axios.get('/logout', {
      params : {
        korisnik : Sesija.korisnik
      }
    })
    .then(response => {
      this.setState({
        rola : ''
      });
    })
  }

  loginKorisnika(korisnik) {
    axios.post('/login', {
        korisnickoIme : korisnik.korisnickoIme,
        lozinka: korisnik.lozinka
      })
      .then(response => {
        var odgovor = response.data;
        if (odgovor.success == 'yes') {
          localStorage.setItem('token', odgovor.korisnik.token);
          localStorage.setItem('id', odgovor.id);
          localStorage.setItem('korisnickoIme', odgovor.korisnik.korisnickoIme);
          Sesija.korisnik.korisnickoIme = odgovor.korisnik.korisnickoIme;
          Sesija.korisnik.token = odgovor.korisnik.token;
          this.setState({
            rola : odgovor.rola,
            id : odgovor.id
          });

        }
        else {
          this.setState({
            poruka : odgovor.msg
          });
        }
    })
    .catch(error => {
      this.setState({
        poruka : error.message
      });
    });

  }

  
  render() {
    var id = this.state.id != null ? this.state.id : localStorage.getItem('id');
    const loginPage = () => <LoginPage onLogin={this.loginKorisnika} poruka={this.state.poruka}/>
    const adminPage = () => <AdminPage  onLogout={this.logout} />
    const osobljePage = () => <OsobljePage onLogout={this.logout} idAdmina={id} korisnik={this.state.korisnik}/>
    const ucesnikPage = () => <UcesnikPage onLogout={this.logout} ucesnikId={id} korisnik={this.state.korisnik}/>
    var redirect = '/';
    var rola = this.state.rola != '' ? this.state.rola : localStorage.getItem('rola');

    Sesija.korisnik.korisnickoIme = localStorage.getItem('korisnickoIme');
    Sesija.korisnik.token = localStorage.getItem('token');
    
  switch(rola) {
      case 'administrator':
        redirect = '/administrator';
        localStorage.setItem('rola', 'administrator');
        break;
      case 'admin_takmicenja': 
        redirect="/admin_takmicenja";
        localStorage.setItem('rola', 'admin_takmicenja');
        break;
      case 'ucesnik':
        redirect='/ucesnik';
        localStorage.setItem('rola', 'ucesnik');
        break;

    }
    return (

      <Router history={history}>
        <div className={styles.App}> 
      <Route  path="/" render={() => (
         
          <Redirect to={redirect}/>
      )}/>
            <Route exact path="/" component={loginPage}/>
            <PrivateRoute path="/administrator" info='administrator'component={adminPage}/>
            <PrivateRoute path="/admin_takmicenja" info='admin_takmicenja'  component={osobljePage}/>
            <PrivateRoute path="/ucesnik" info='ucesnik' component={ucesnikPage}/>
      </div>
      </Router>
    );
  }
}

export default App; 
