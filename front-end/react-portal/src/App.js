import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import TopNavigationBar from './global-support/TopNavigationBar';
import Attribution from './global-support/Attribution';
import CreationPortal from './bot-creation/CreationPortal';
import ViewBotsPortal from './view-bots/ViewBotsPortal';

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <TopNavigationBar />
        <Router>
          <div>
            <Switch>
              <Route path="/create">
                <Create theme={theme}/>
              </Route>
              <Route path="/bots">
                <Bots theme={theme}/>
              </Route>
              <Route path="/">
                <Redirect to="/bots" />
              </Route>
            </Switch>
          </div>
        </Router>
        <Attribution />
      </ThemeProvider>
    </React.Fragment>
  );
}

function Create(props) {
  return (
    <ThemeProvider theme={props.theme}>
      <CreationPortal />
    </ThemeProvider>
  );
}

function Bots(props) {
  return (
    <ThemeProvider theme={props.theme}>
      <ViewBotsPortal />
    </ThemeProvider>
  );
}
