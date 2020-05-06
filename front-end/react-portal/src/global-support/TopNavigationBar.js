import React, { useState }from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
    marginBottom: theme.spacing(5),
  },
  title: {
    flexGrow: 1,
  },
  menuButton: {
  	margin: theme.spacing(1),
  },
}));

export default function TopNavigationBar(props) {
	const classes = useStyles();

  function stateMaker(activeWindow) {
    let botsVariant = 'text';
    let botsDisabled = false;
    let createVariant = 'text';
    let createDisabled = false;

    // This is the initial state upon render
    switch (activeWindow) {
      case '#/bots':
        botsVariant = 'outlined';
        botsDisabled = true;
        break;
      case '#/create':
        createVariant = 'outlined';
        createDisabled = true;
        break;
      default: break;
    }

    const createdState = {
      bots: {
        variant: botsVariant,
        disabled: botsDisabled,
      },
      create: {
        variant: createVariant,
        disabled: createDisabled,
      }
    }
    return createdState;
  }

  const initialState = stateMaker(window.location.hash);
  const [state, updateState] = useState(initialState);

	return (
		<AppBar position="absolute" color="default" className={classes.appBar}>
	    <Toolbar>
	      <Typography variant="h6" color="inherit" noWrap className={classes.title}>
	        bots-as-a-service
	      </Typography>

	      <Button
          className={classes.menuButton}
          color="inherit"
          href="#/bots"
          variant={ state.bots.variant }
          disabled={ state.bots.disabled }
          onClick={ () => updateState(stateMaker("#/bots")) }
        >
          bots
        </Button>
	      <Button
           className={classes.menuButton}
           color="inherit"
           href="#/create"
           variant={ state.create.variant }
           disabled={ state.create.disabled }
           onClick={ () => updateState(stateMaker("#/create")) }
        >
           create
         </Button>
	    </Toolbar>
	  </AppBar>
	);
}
