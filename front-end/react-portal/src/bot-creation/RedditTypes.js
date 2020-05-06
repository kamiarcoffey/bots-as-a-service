import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
  },
}));

export default function RedditTypesCheckboxGroup() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    subreddits: true,
    livethreads: false,
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const { subreddits, livethreads } = state;
  const error = [subreddits, livethreads].filter(v => v).length === 0;

  // For now, we're hardcoding these to true/false and disabling inputs entirely.
  // Current project scope is going to be only subreddits.
  return (
    <div className={classes.root}>
      <FormControl required error={error} component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">triggers</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={subreddits} onChange={handleChange('subreddits')} value="subreddits" />}
            label="subreddits"
            disabled
          />
          <FormControlLabel
            control={<Checkbox checked={livethreads} onChange={handleChange('livethreads')} value="livethreads" />}
            label="livethreads (not yet implemented)"
            disabled
          />
        </FormGroup>
        <FormHelperText>what to trigger your bot on. must check at least one option.</FormHelperText>
      </FormControl>
    </div>
  );
}
