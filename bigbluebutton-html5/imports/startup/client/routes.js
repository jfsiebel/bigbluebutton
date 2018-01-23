import React from 'react';
import { Router, Route, Redirect, IndexRoute, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import LoadingScreen from '/imports/ui/components/loading-screen/component';
import { joinRouteHandler, logoutRouteHandler, authenticatedRouteHandler } from './auth';
import Base from './base';


const browserHistory = createBrowserHistory({
  basename: Meteor.settings.public.app.basename,
});

const renderRoutes = () => (
  <Router history={browserHistory}>
    <Switch>
      <Route path="/logout" render={() => {
        logoutRouteHandler();
        return null;
      }} />
      <Route path="/join" render={({ history, location }) => {
        joinRouteHandler(location, history);
        return <LoadingScreen />
      }} />
      <Route path="/" render={({ history, location }) => {
        authenticatedRouteHandler(location, history)
        return <Base />
      }} />
      <Route name="meeting-ended" path="/ended/:endedCode" component={Base} />
      <Route name="error" path="/error/:errorCode" component={Base} />
      <Redirect from="*" to="/error/404" />
    </Switch>
  </Router>
);
export default renderRoutes;
