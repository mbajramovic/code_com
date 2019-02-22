import React, {Component} from 'react';

class Greska extends Component {
    constructor(props) {
        super(props);

        this.state = {
            greska : this.props.greska
        };
        this.prikaziDetalje();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            greska : nextProps.greska
        });
        this.prikaziDetalje();
    }

    prikaziDetalje() {
        document.getElementById("mySidenav").style.height = "30%";
    }
        
    closeNav() {
        document.getElementById("mySidenav").style.height = "0";
    }

    render() {
        return(
            <div className="sidenav_admin" id="mySidenav">
                <table style={{margin: '3%'}}>
                    <tbody>
                        <tr>
                            <td>
                                <div style={{ marginBottom : '0', textAlign : 'left'}}>
                                    <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav.bind(this)}>&times;</a>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <p className="greska">{this.state.greska}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div> 
        );
    }
}

export default Greska;