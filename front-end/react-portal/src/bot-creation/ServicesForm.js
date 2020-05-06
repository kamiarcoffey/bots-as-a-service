import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
//import ServicePanel from './support/ServicePanel';
import { withStyles } from '@material-ui/core/styles';
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
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';

const styles = (theme) => ({
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
});


class ServicesForm extends React.Component {
  constructor(props) {
    super(props);
		if (props.payload === undefined || props.payload === {}){
			this.state = {
	      alertShown: false,
	      fandom: {
	        hasError: false,
	        isEnabled: false,
	        isAvailable: true,
	        invocation: {
	          symbol: "!",
	          term: "fandom",
	          query: "[[ ]]",
	        },
	        inputs: {
	          fandom_name: {
	            isErrored: false,
	            val: "baas",
	          }
	        }
	      },
	      translate: {
	        hasError: false,
	        isEnabled: false,
	        isAvailable: true,
	        invocation: {
	          symbol: "!",
	          term: "translate",
	          query: "[[ ]]",
	        }
	      },
	      flights: {
	        hasError: false,
	        isEnabled: false,
	        isAvailable: false,
	      }
	    }
		} else {
			this.state = props.payload;
		}


    this.handleFandomSwitchToggle = this.handleFandomSwitchToggle.bind(this);
    this.handleFandomIndicator = this.handleFandomIndicator.bind(this);
    this.handleTranslateSwitchToggle = this.handleTranslateSwitchToggle.bind(this);
    this.handleTranslateIndicator = this.handleTranslateIndicator.bind(this);
    this.handleFandomTextInputOnChange = this.handleFandomTextInputOnChange.bind(this);
  }

  handleFandomSwitchToggle(event) {
    event.stopPropagation();
    let newState = Object.assign({}, this.state);
    newState.fandom.isEnabled = !this.state.fandom.isEnabled;
    newState.alertShown = (!newState.translate.isEnabled && !newState.fandom.isEnabled);
    this.setState(newState);
  }

  handleFandomIndicator(event, newIndicator) {
    if (newIndicator !== null) {
      let newState = Object.assign({}, this.state);
      newState.fandom.invocation.query = newIndicator;
      this.setState(newState);
    }
  };

  handleFandomTextInputOnChange(event) {
    let newVal = event.target.value;
    let newState = Object.assign({}, this.state);
    newState.fandom.inputs.fandom_name.isErrored = newVal.length === 0;
    newState.fandom.inputs.fandom_name.val = newVal;
    newState.fandom.hasError = newVal.length === 0;
    this.setState(newState);
  }

  handleTranslateSwitchToggle(event) {
    event.stopPropagation();
    let newState = Object.assign({}, this.state);
    newState.translate.isEnabled = !this.state.translate.isEnabled;
    newState.alertShown = (!newState.translate.isEnabled && !newState.fandom.isEnabled);
    this.setState(newState);
  }

  handleTranslateIndicator(event, newIndicator) {
    if (newIndicator !== null) {
      let newState = Object.assign({}, this.state);
      newState.translate.invocation.query = newIndicator;
      this.setState(newState);
    }
  };

  returnDataOrNull() {
    // This will give us validation.
    // Return null if there are any errors.
    if (!this.state.fandom.isEnabled && !this.state.translate.isEnabled) {
      let newState = Object.assign({}, this.state);
      newState.alertShown = true;
      this.setState(newState);
      return null;
    } else if (this.state.fandom.hasError || this.state.translate.hasError) {
      return null;
    } else {
      return this.state;
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography variant="h6" gutterBottom>
          services
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <Collapse in={ this.state.alertShown }>
              <Alert severity="warning" onClick={() => {
                let newState = Object.assign({}, this.state);
                newState.alertShown = false;
                this.setState(newState);
              }}>Your bot won't be cool without a service -- enable at least one!</Alert>
            </Collapse>
          </Grid>
          <Grid item xs={12} md={12}>
            <ExpansionPanel
              expanded={ this.state.fandom.isEnabled }
              disabled={ !this.state.fandom.isAvailable }
              className={ classes.panelMain }
            >
              <ExpansionPanelSummary
                className={ classes.panelSummary }
                aria-controls="fandom-content"
                id="fandom-header"
              >
                <FormControlLabel
                  aria-label="Acknowledge"
                  className={ classes.heading }
                  onClick={ this.handleFandomSwitchToggle }
                  onFocus={ this.handleFandomSwitchToggle }
                  control={ <Switch checked={ this.state.fandom.isEnabled } size="small" /> }
                  label="fandom"
                />
                <Typography className={ classes.secondaryHeading }>
                  Search the input fandom and return the top results.
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={ classes.panelDetails }>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12}>
                    <TextField
        							className={ classes.inputFields }
        							label="name"
											value={ this.state.fandom.inputs.fandom_name.val }
        							helperText="the fandom subdomain, i.e.: [name].fandom.com"
        							color="primary"
                      error={ this.state.fandom.inputs.fandom_name.isErrored }
        							required={ true }
                      onChange={ this.handleFandomTextInputOnChange }
        							inputProps={{
        								className: classes.rightTextAlign,
        								align: "right",
        							}}
        							InputProps={{
        								endAdornment: <InputAdornment position="end">.fandom.com</InputAdornment>,
        							}}
        							variant="outlined"
        						/>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
              <Divider />
              <ExpansionPanelDetails className={ classes.panelDetails }>
                <Grid container spacing={1}>
                  <Grid item xm={12} sm={12}>
                    <ToggleButtonGroup
                      hidden={ false }
                      size="small"
                      value={ this.state.fandom.invocation.query }
                      exclusive
                      onChange={ this.handleFandomIndicator }
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
                    <Typography className={ classes.panelCaption } variant="caption" display="block">
                      query indicator - an example invocation:
                    </Typography>
                    <Typography className={ classes.panelCaption } variant="caption" display="block">
                       <code>
                        { this.state.fandom.invocation.symbol + this.state.fandom.invocation.term }
                        { this.state.fandom.invocation.query.replace(" ", "search-term") }
                       </code>
                    </Typography>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>


          <ExpansionPanel
            expanded={ this.state.translate.isEnabled }
            disabled={ !this.state.translate.isAvailable }
            className={ classes.panelMain }
          >
            <ExpansionPanelSummary
              className={ classes.panelSummary }
              aria-controls="translation-content"
              id="translation-header"
            >
              <FormControlLabel
                aria-label="Acknowledge"
                className={ classes.heading }
                onClick={ this.handleTranslateSwitchToggle }
                onFocus={ this.handleTranslateSwitchToggle }
                control={ <Switch checked={ this.state.translate.isEnabled } size="small" /> }
                label="translation"
              />
              <Typography className={ classes.secondaryHeading }>
                Translate the parent post or comment to the target language.
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={ classes.panelDetails }>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
        					<Typography variant="caption">no inputs for this service</Typography>
        				</Grid>
              </Grid>
            </ExpansionPanelDetails>
            <Divider />
            <ExpansionPanelDetails className={ classes.panelDetails }>
              <Grid container spacing={1}>
                <Grid item xm={12} sm={12}>
                  <ToggleButtonGroup
                    hidden={ false }
                    size="small"
                    value={ this.state.translate.invocation.query }
                    exclusive
                    onChange={ this.handleTranslateIndicator }
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
                  <Typography className={ classes.panelCaption } variant="caption" display="block">
                    query indicator - an example invocation:
                  </Typography>
                  <Typography className={ classes.panelCaption } variant="caption" display="block">
                     <code>
                      { this.state.translate.invocation.symbol + this.state.translate.invocation.term }
                      { this.state.translate.invocation.query.replace(" ", "search-term") }
                     </code>
                  </Typography>
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>

          <ExpansionPanel
            expanded={ this.state.flights.isEnabled }
            disabled={ !this.state.flights.isAvailable }
            className={ classes.panelMain }
          >
            <ExpansionPanelSummary
              className={ classes.panelSummary }
              aria-controls="flights-content"
              id="flights-header"
            >
              <FormControlLabel
                aria-label="Acknowledge"
                className={ classes.heading }
                control={ <Switch checked={ this.state.flights.isEnabled } size="small" /> }
                label="flights"
              />
              <Typography className={ classes.secondaryHeading }>
                Get flight data.
              </Typography>
            </ExpansionPanelSummary>
          </ExpansionPanel>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(ServicesForm);
