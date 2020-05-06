import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Divider from '@material-ui/core/Divider';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles(theme => ({
	root: {
    width: '100%',
  },
	enabledBotSummary: {
		backgroundColor: theme.palette.success.dark,
	},
	header: {
    backgroundColor: theme.palette.background.default
  },
  heading: {
    fontSize: theme.typography.pxToRem(16),
		color: theme.palette.text.primary,
    flexGrow: 1,
		verticalAlign: 'baseline',
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    justifyContent: "flex-end",
		marginRight: "1rem",
  },
  startButton: {
  	color: theme.palette.success.light,
  },
  pauseButton: {
  	color: theme.palette.primary.light,
  },
	deleteButton: {
  	color: theme.palette.error.dark,
  },
	backdrop: {
	 	zIndex: theme.zIndex.drawer + 1,
	 	color: '#fff',
	},
}));

function ServiceRow ({ name, payload }) {

  const getInputsItem = () => {
    if (typeof payload.params === "object") {
			return (Object.entries(payload.params).map(([k, v]) =>{
				return <li key={k}>{k}: {v}</li>;
			}))
    }
  }

  const getInvocationItem = () => {
    if (payload.invocation !== undefined) {
      return (
        <li>
          invocation:
          <code>
          { " " + payload.invocation.symbol + payload.invocation.term }
          { payload.invocation.query.replace(" ", "search-term") }
          </code>
        </li>
      );
    }
  }

  return (
    <TableRow>
      <TableCell component="th" scope="row">{ name }</TableCell>
      <TableCell>
        <ul>
          { getInputsItem() }
          { getInvocationItem() }
        </ul>
      </TableCell>
    </TableRow>
  )
}

export default function ViewBotsPanel({payload}){
	const classes = useStyles();
	const isOnline = !payload.status.online;

	// Global "is this panel processing something."
	const [isProcessing, setIsProcessing] = React.useState(false);
	const [alertStatus, setAlertStatus] = React.useState({severity: "error", message: ""});
	const [botState, setBotState] = React.useState(isOnline ? 'disabled' : 'active')

	const [needToReload, setNeedToReload] = React.useState(false);

	const isPlayButtonDisabled = !isOnline;
	const isPauseButtonDisabled = !isPlayButtonDisabled;
	const isDeleteButtonDisabled = isPlayButtonDisabled;

	const createServiceRow = (serviceConfigs) => {
		const serviceName = serviceConfigs.service_name
    return <ServiceRow key={serviceName} payload={serviceConfigs} name={serviceName} />;
  }

	const closeAlert = (event) => {
		event.preventDefault();
		setAlertStatus({severity: "error", message: ""});
	}

	const processError = (err) => {
		err.text().then(
			(text) => {setAlertStatus({
				severity: "error",
				message: `error! (${err.status}): ${text}`,
			})}
		)
		setIsProcessing(false);
	}

	const processStartButton = (event) => {
		event.preventDefault();
		if (!isProcessing) {
			setIsProcessing(true);
			fetch(`https://us-central1-bots-as-a-service.cloudfunctions.net/activate-bot`, {
				method: "put",
				body: `{"id": "${payload.name}"}`,
			})
				.then((response) => {
					if (!response.ok) {
						throw response;
					}
					return response.json();
				})
				.then((data) => {
					console.log(data);
					setIsProcessing(false);
					setAlertStatus({
						severity: "success",
						message: "successfully activated bot. can take up to a minute to warm up and start."
					});
					setBotState("reload to see status");
					setNeedToReload(true);
				})
				.catch(processError)
		}
	}

	const processDisableButton = (event) => {
		event.preventDefault();
		if (!isProcessing) {
			setIsProcessing(true);
			fetch(`https://us-central1-bots-as-a-service.cloudfunctions.net/deactivate-bot`, {
				method: "put",
				body: `{"id": "${payload.name}"}`,
			})
				.then((response) => {
					if (!response.ok) {
						throw response;
					}
					return response.json();
				})
				.then((data) => {
					console.log(data);
					setIsProcessing(false);
					setAlertStatus({
						severity: "success",
						message: "successfully deactivated bot."
					});
					setBotState("reload to see status");
					setNeedToReload(true);
				})
				.catch(processError);
		}
	}

	const processDeleteButton = (event) => {
		event.preventDefault();
		if (!isProcessing) {
			setIsProcessing(true);
			fetch(`https://us-central1-bots-as-a-service.cloudfunctions.net/delete-bot`, {
				method: "delete",
				body: `{"id": "${payload.name}"}`,
			})
				.then((response) => {
					if (!response.ok) {
						throw response;
					}
					setIsProcessing(false);
					setAlertStatus({
						severity: "success",
						message: "successfully deleted bot."
					});
					setBotState("reload to see status");
					setNeedToReload(true);
				})
				.catch(processError);
		}
	}


	return (
		<ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
				className={ isOnline ? null : classes.enabledBotSummary  }
        aria-controls={ payload.name + "-content" }
        id={ payload.name + "-header" }
      >
        <Typography className={classes.heading}>{ payload.name }</Typography>
        <Typography className={classes.secondaryHeading}>{ botState }</Typography>
				<Divider orientation="vertical" flexItem />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
			<Backdrop className={classes.backdrop} open={isProcessing}>
			  <CircularProgress color="inherit" />
			</Backdrop>

			<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
				<Collapse in={ alertStatus.message.length > 0 }>
					<Alert onClose={closeAlert} severity={alertStatus.severity}>{alertStatus.message}</Alert>
				</Collapse>
				</Grid>
				<Grid item xs={4} sm={4}>
					<TableContainer component={Paper}>
						<Table className={classes.header} aria-label="simple table">
							<caption>bot data</caption>
							<TableHead>
								<TableRow>
									<TableCell><Typography variant="h6">key</Typography></TableCell>
									<TableCell align="right"><Typography variant="h6">value</Typography></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
							<TableRow>
								<TableCell component="th" scope="row">name</TableCell>
								<TableCell align="right">{ payload.name }</TableCell>
							</TableRow>
							<TableRow>
								<TableCell component="th" scope="row">enabled for</TableCell>
								<TableCell align="right">subreddits</TableCell>
							</TableRow>
							<TableRow>
								<TableCell component="th" scope="row">targets</TableCell>
								<TableCell align="right">
									{payload.subreddits.join(', ')}
								</TableCell>
							</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
				<Grid item xs={8} sm={8}>
					<TableContainer component={Paper}>
						<Table className={classes.header} aria-label="simple table">
							<caption>services data</caption>
							<TableHead>
								<TableRow>
								<TableCell><Typography variant="h6">enabled services</Typography></TableCell>
								<TableCell><Typography variant="h6">configurations</Typography></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{ payload.services.map(createServiceRow) }
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
			</Grid>
      </ExpansionPanelDetails>
      <Divider />
      <ExpansionPanelActions>
      	<Button
					className={classes.startButton}
					onClick={processStartButton}
					startIcon={<PlayArrowIcon />}
					disabled={ needToReload || isPlayButtonDisabled }
				>
	        Start
	      </Button>
	      <Button
					className={classes.pauseButton}
					onClick={processDisableButton}
					startIcon={<PauseIcon />}
					disabled={ needToReload || isPauseButtonDisabled }
				>
	        Disable
	      </Button>
        <Button
					className={classes.deleteButton}
					onClick={processDeleteButton}
					startIcon={<DeleteIcon />}
					disabled={ needToReload || isDeleteButtonDisabled }
				>
	        Delete
	      </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
	);
}
