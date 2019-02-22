import React, { Component } from 'react'
import ucesnik_logo from '../../../images/ucesnik.png';

import Sesija from '../../Sesija.js';
const axios = require('axios');

//pregled profila ucesnika
class ProfilUcesnika extends Component {
    constructor(props) {
        super(props);
        //this.state={showBack:location.hash.split('?')[0]!=="#/"};
       
        this.state = {
            ucesnik : '',
            grupe : null,
            lokacija : ''
            //showBack : location.hash.split('?')[0]!=="#/"
        };
        this.povuciInformacije = this.povuciInformacije.bind(this);
        this.goBack = this.goBack.bind(this); 
        
        
    }



    componentWillMount() {
        this.povuciInformacije();
    }

    povuciInformacije() {
        axios.get('/ucesnik', {
            params : {
                id : this.props.match.params.id,

                korisnickoIme : Sesija.korisnik.korisnickoIme,
                token : Sesija.korisnik.token
            }
        })
        .then(response => {
            if (response.data.success)
                this.setState({
                    ucesnik : response.data.ucesnik,
                    grupe : response.data.grupe,
                    lokacija : response.data.lokacija
                });
            else {
                alert(response.data.data);
            }
        })
        .catch(error => {
            alert(error.message);
        })
    }

    goBack() {
        this.props.history.goBack();
    }

    render() {
        if (this.state.grupe) {
            var grupe = this.state.grupe.map((grupa) => (
            <div className="nivo_3">
                <p className="naslov_2">Takmičarska grupa</p>
                <h4>{grupa.takmicarskaGrupa}</h4>
                <p className="naslov_2">Takmičenje</p>
                <h4>{grupa.takmicenje}</h4>
            </div>
            ));
        }
        const ucesnik = this.state.ucesnik;
        const lokacija = this.state.lokacija;
        return (
            <div >
                <div>
                    <p className="naslov">Profil učesnika: {ucesnik.ime + ' ' + ucesnik.prezime}</p>
                </div>
                <div className="licniPodaci">
                    <img className="velikaSlika" src={ucesnik_logo}></img>
                    <p className="naslov_2">Ime i prezime</p>
                    <h5>{ucesnik.ime + ' ' + ucesnik.prezime}</h5>
                    <p className="naslov_2">JMBG</p>
                    <h5>{ucesnik.maticniBroj}</h5>
                    <p className="naslov_2">Grad</p>
                    <h5>{lokacija.grad}</h5>
                </div>
                <div className="lokacija">
                    <p className="naslov_2">Lokacija učesnika</p>
                    <div className="nivo_3">
                        <p className="naslov_2">Škola</p>
                        <h4>{lokacija.skola}</h4>
                        <p className="naslov_2">Grad</p>
                        <h4>{lokacija.grad}</h4>
                        <p className="naslov_2">Općina</p>
                        <h4>{lokacija.opcina}</h4>
                        <p className="naslov_2">Kanton</p>
                        <h4>{lokacija.kanton}</h4>
                        <p className="naslov_2">Država</p>
                        <h4>{lokacija.drzava}</h4>
                    </div>
                </div>    
                <div className="takmicenjaInfo">                
                    <p className="naslov_2">Informacije o takmičenju</p>
                    {grupe}
                </div>
            </div>
        )
    }
}

export default ProfilUcesnika;  