import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import InputAdornment from '@material-ui/core/InputAdornment';
import Divider from '@material-ui/core/Divider';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const useStyles = makeStyles(theme => ({
	root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(16),
		color: theme.palette.text.primary,
    flexGrow: 1,
		verticalAlign: 'baseline',
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(16),
    color: theme.palette.text.secondary,
    justifyContent: "flex-end",
		marginRight: "1rem",
  },
  panelMain: {
    backgroundColor: theme.palette.background.default,
  },
  panelSummary: {
    borderBottom: '2px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
  },
  panelDetails: {
    padding: theme.spacing(2),
  },
  panelCaption: {
    color: theme.palette.text.secondary,
  },
  rightTextAlign: {
    textAlign: "right",
  }
}));


export default function ServicePanel({ payload, callback }) {
  const classes = useStyles();

  const [isEnabled, setEnabled] = React.useState(payload.defaultOn);

  const [queryIndicator, setQueryIndicator] = React.useState('[[ ]]');

  const handleIndicator = (event, newIndicator) => {
    if (newIndicator !== null) {
      setQueryIndicator(newIndicator);
    }
  };

  const handleSwitchToggle = (event) => {
    event.stopPropagation();
    // Kind of hacky? Need to control state for multiple all components.
    // Pretty much ignore the actual state of the state/expand
    // And rely only on the enabled/disabled state to control all sub-components
    setEnabled(!isEnabled);
  }

	const getinputsList = () => {
		if (payload.inputs.length === 0) {
			return (
				<Grid item xs={12} sm={6}>
					<Typography variant="caption">no inputs for this service</Typography>
				</Grid>
			);
		} else {
			return payload.inputs.map((inputField) => {
				let elem = null;
				switch (inputField.flavor) {
					case 'text':
						elem = <TextField
							className={ classes.inputFields }
							label={ inputField.name }
							helperText={ inputField.helperText }
							color="primary"
							required={ inputField.required }
							inputProps={{
								className: classes.rightTextAlign,
								align: "right",
							}}
							InputProps={{
								endAdornment: <InputAdornment position="end">{ inputField.adornments.end }</InputAdornment>,
							}}
							variant="outlined"
						/>;
						break;
					default:
						console.log(`Could not process input field flavor: ${inputField.flavor}`)
						break;
				}
				return <Grid key={ inputField.name } item xs={12} sm={6}>{ elem }</Grid>;
			})
		}
	}


  return (
    <ExpansionPanel
      expanded={ isEnabled }
      disabled={ !payload.available }
      className={ classes.panelMain }
    >
      <ExpansionPanelSummary
        className={ classes.panelSummary }
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <FormControlLabel
          aria-label="Acknowledge"
          className={ classes.heading }
          onClick={ handleSwitchToggle }
          onFocus={ handleSwitchToggle }
          control={ <Switch checked={ isEnabled } size="small" /> }
          label={ payload.name }
        />
        <Typography className={ classes.secondaryHeading }>
          { payload.description }
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={ classes.panelDetails }>
        <Grid container spacing={3}>
        { getinputsList() }
        </Grid>
      </ExpansionPanelDetails>
      <Divider />
      <ExpansionPanelDetails className={ classes.panelDetails }>
        <Grid container spacing={1}>
          <Grid item xm={12} sm={12}>
            <ToggleButtonGroup
              hidden={!payload.configurableQuery}
							size="small"
              value={ queryIndicator }
              exclusive
              onChange={ handleIndicator }
              aria-label="indicator selector"
            >
              <ToggleButton value="[[ ]]" aria-label="double square bracket">
                {"[[ ]]"}
              </ToggleButton>
              <ToggleButton value="{{ }}" aria-label="double curly brackets">
                {"{{ }}"}
              </ToggleButton>
              <ToggleButton value="< >" aria-label="right aligned">
                {"< >"}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xm={12} sm={12}>
            <Typography className={classes.panelCaption} variant="caption" display="block">
              query indicator - an example invocation: <code>{payload.invocation.symbol + payload.invocation.term} { queryIndicator.replace(" ", "search-term") }</code>
            </Typography>
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}
