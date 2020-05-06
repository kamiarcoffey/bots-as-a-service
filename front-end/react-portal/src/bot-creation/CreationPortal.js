import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import BotDetailsForm from './BotDetailsForm';
import ServicesForm from './ServicesForm';
import BotSummary from './BotSummary';
import FinishedWorkflow from './FinishedWorkflow';

const useStyles = makeStyles(theme => ({
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 1000,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

const steps = ['details', 'services', 'review', 'finished'];

function getStepContent(step, ref, payload) {
  switch (step) {
    case 0:
      return <BotDetailsForm payload={payload} ref={ref} />;
    case 1:
      return <ServicesForm payload={payload} ref={ref} />;
    case 2:
      return <BotSummary payload={payload} ref={ref} />;
    case 3:
      return <FinishedWorkflow payload={payload} />;
    default:
      throw new Error('Unknown step');
  }
}

export default function CreationPortal() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [stepData, setStepData] = React.useState({});
  let ref = React.createRef();

  const handleNext = () => {
    let thisStepData = ref.current.returnDataOrNull()

    if (thisStepData !== null) {
      stepData[activeStep] = thisStepData;
      const nextStep = activeStep + 1;
      // Hacky alarm! If the next is the summary page, send
      // the entire package.
      if (nextStep >= 2) {
        let allData = Object.assign({}, stepData);
        stepData[nextStep] = allData;
      }
      setStepData(stepData);
      setActiveStep(activeStep + 1);
    }
    else {
      console.log("didn't get any data; forcing stop.");
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  document.title = 'bots-as-a-service: create';
  return (
    <React.Fragment>
      <CssBaseline />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            create-a-bot
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
             <React.Fragment>
                {getStepContent(activeStep, ref, stepData[activeStep])}
                <div className={classes.buttons}>
                  {activeStep !== 0 && activeStep !== steps.length - 1 && (
                    <Button onClick={handleBack} className={classes.button}>
                      Back
                    </Button>
                  )}
                  {activeStep !== steps.length - 1 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.button}
                    >
                      {activeStep === 2 ? 'submit' : 'next'}
                    </Button>
                  )}
                </div>
              </React.Fragment>
          </React.Fragment>
        </Paper>
      </main>
    </React.Fragment>
  );
}
