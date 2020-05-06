import React, { useEffect } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Alert from '@material-ui/lab/Alert';

import ViewBotsPanel from './support/ViewBotsPanel';


export default function ViewBotsPortal(){
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		document.title = 'bots-as-a-service: bots';
		if (!loadedIn) {
			if (!isLoading) {
				setIsLoading(true);
				fetch("https://us-central1-bots-as-a-service.cloudfunctions.net/get-bots")
					.then((response) => {
						if (!response.ok) {
							setAlertStatus({severity: "error", message: response.text});
							setLoadedIn(true);
							setIsLoading(false);
						}
						return response.json();
					})
					.then((data) => {
						setBotsList(data.map((payload) =>
							<ViewBotsPanel key={payload.name} payload={payload} />
						))
						setLoadedIn(true);
						setAlertStatus({
							severity: "error",
							message: "",
						})
					})
			}
		}
	})

	const [loadedIn, setLoadedIn] = React.useState(false);
	// Flag to ensure only one thread starts making network requests + loading data.
	const [isLoading, setIsLoading] = React.useState(false);
	const [botsList, setBotsList] = React.useState([]);
	const [alertStatus, setAlertStatus] = React.useState({severity: "error", message: ""});

	return (
		<React.Fragment>
			<CssBaseline />
			<Container>
				<Typography variant="h3" gutterBottom>
					bots
				</Typography>
				{ alertStatus.message.length > 0 ? <Alert severity={alertStatus.severity}>{alertStatus.message}</Alert> : null}
				{	loadedIn ?
						botsList.length > 0 ? botsList
						: <Typography variant="caption">no bots yet. create one!</Typography>
					 : (
					<Container>
						<Alert severity="info">getting bot data...</Alert>
						<ExpansionPanel>
							<ExpansionPanelSummary>
								<Skeleton animation="wave" height={10} width="30%" />
							</ExpansionPanelSummary>
						</ExpansionPanel>
						<ExpansionPanel>
							<ExpansionPanelSummary>
								<Skeleton animation="wave" height={10} width="30%" />
							</ExpansionPanelSummary>
						</ExpansionPanel>
						<ExpansionPanel>
							<ExpansionPanelSummary>
								<Skeleton animation="wave" height={10} width="30%" />
							</ExpansionPanelSummary>
						</ExpansionPanel>
						<ExpansionPanel>
							<ExpansionPanelSummary>
								<Skeleton animation="wave" height={10} width="30%" />
							</ExpansionPanelSummary>
						</ExpansionPanel>
						<ExpansionPanel>
							<ExpansionPanelSummary>
								<Skeleton animation="wave" height={10} width="30%" />
							</ExpansionPanelSummary>
						</ExpansionPanel>
					</Container>
				)}
			</Container>
		</React.Fragment>
	);
}
