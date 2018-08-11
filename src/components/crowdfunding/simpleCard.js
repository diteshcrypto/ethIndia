import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

const styles = {
  card: {
    minWidth: 275,
    height: 275
  },
  title: {
    marginBottom: 26,
    fontSize: 24,
  },
  pos: {
    marginBottom: 22,
  },
  textField: {
    width: 200,
    fontSize: 24
  },
};

function SimpleCard(props) {
  const { classes } = props;
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <div>
      <Card className={classes.card}>
          
          <TextField
            id="name"
            label="Name"
            className={classes.title}
            value='some'
            // onChange={this.handleChange('name')}
            margin="normal"
          />

        <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>
    </div>
  );
}

SimpleCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleCard);