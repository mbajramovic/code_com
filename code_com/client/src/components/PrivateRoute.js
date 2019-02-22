import React from 'react';  
import { Redirect, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
// Utils

const PrivateRoute = ({ component: Component, ...rest }) => (  
  <Route {...rest} render={props => (
    (localStorage.getItem('token')  && localStorage.getItem('rola') === rest.info) ? (
      <Component {...props} />
    ) : (
      <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      
        }}
      />
    )
  )} />
);



export default PrivateRoute;