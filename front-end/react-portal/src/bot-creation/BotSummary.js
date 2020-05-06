import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';



const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.background.default
  },
  disabled: {
    backgroundColor: theme.palette.text.disabled
  }
});

function ServiceRow ({ props, name }) {

  const getInputsItem = () => {
    if (props.inputs !== undefined) {
      return (Object.entries(props.inputs).map(([k, v]) =>{
				return <li key={k}>{k}: {v.val}</li>;
			}))
    }
  }

  const getInvocationItem = () => {
    if (props.invocation !== undefined) {
      return (
        <li>
          invocation:
          <code>
          { " " + props.invocation.symbol + props.invocation.term }
          { props.invocation.query.replace(" ", "search-term") }
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


class BotSummary extends React.Component {
  constructor(props){
    super(props);
    this.botData = props.payload;
    this.createServiceRow = this.createServiceRow.bind(this);
  }

  returnDataOrNull () {
    return this.botData;
  }

  createServiceRow([serviceName, serviceConfigs]) {
    if (typeof serviceConfigs == "object" && serviceConfigs.isEnabled) {
      return <ServiceRow key={serviceName} props={serviceConfigs} name={serviceName} />;
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography variant="h5" gutterBottom>
          summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4} sm={4}>
            <TableContainer component={Paper}>
              <Table className={classes.header} aria-label="simple table">
                <caption>bot data</caption>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="h5">key</Typography></TableCell>
                    <TableCell align="right"><Typography variant="h5">value</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">name</TableCell>
                  <TableCell align="right">{ this.botData[0].nameInput.val }</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">enabled for</TableCell>
                  <TableCell align="right">subreddits</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">targets</TableCell>
                  <TableCell align="right">
                    {this.botData[0].subredditInput.val.join(', ')}
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
                  <TableCell><Typography variant="h5">enabled services</Typography></TableCell>
                  <TableCell><Typography variant="h5">configurations</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { Object.entries(this.botData[1]).map(this.createServiceRow) }
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

}

export default withStyles(styles)(BotSummary);
