import React,{ Component } from 'react';
import { setInterval } from 'timers';

import io from 'socket.io-client';

const server = require('../serverinfo.json').server;

class Sat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            vrijeme : {},
            sekunde : this.props.sekunde,
            takmicenjeId : this.props.takmicenjeId
        };
        this.timer = 0;
        this.done = false;
        this.ucesnik = this.props.ucesnik;
        this.odbrojavaj = this.odbrojavaj.bind(this);
        this.pretvoriSekunde = this.pretvoriSekunde.bind(this);
        this.socket = io(server.ip + ':' + server.port);
        this.emit = data => {
            this.socket.emit('TIMER', {
                id : data
            });
        }
    }

    componentDidMount() {
        this.setState({
            vrijeme : this.pretvoriSekunde(this.state.sekunde)
        });                        
        this.timer = setInterval(this.odbrojavaj, 1000);
    }

    pretvoriSekunde(sekunde) {
        var sati = Math.floor(sekunde / (60 * 60)),
            minute = Math.floor((sekunde % (60 * 60))/60),
            sekunde = Math.floor(((sekunde % (60 * 60)) % 60));
        //alert(sekunde)
        var sat = {
            'sati' : sati, 'minute' : minute, 'sekunde' : sekunde
        };

        return sat;
    }

    odbrojavaj() {
        var sekunde = this.state.sekunde - 1;
        this.setState({
            vrijeme : this.pretvoriSekunde(sekunde),
            sekunde : sekunde
        });
        
        if (sekunde < 1 && !this.done && this.ucesnik != 1) {
            clearInterval(this.odbrojavaj);
            this.emit(this.state.takmicenjeId);
            this.done = true;
        }
    }
    



    render() {
        return (
           <div style={{border : '1px solid #009973', borderRadius : '12px', marginTop : '5%'}}>
                {this.state.vrijeme.sekunde > 0 ? 
                <div>
                    {this.state.vrijeme.sati < 9 ? '0' + this.state.vrijeme.sati : this.state.vrijeme.sati}:
                    {this.state.vrijeme.minute < 9 ? '0' + this.state.vrijeme.minute : this.state.vrijeme.minute}:
                    {this.state.vrijeme.sekunde < 9 ? '0' + this.state.vrijeme.sekunde : this.state.vrijeme.sekunde}
                </div>
                :
                <div>
                    0:0:0
                </div>
                }
            </div>
        )
    }
}


export default Sat;