import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  attribution: {
    marginTop: theme.spacing(5),
  },
}));

export default function Attribution() {
	const classes = useStyles();

  return (
    <Typography variant="body2" color="textSecondary" align="center" className={classes.attribution}>
      created and maintained for csci-5828, team 10
    </Typography>
  );
}
