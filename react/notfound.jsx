import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

class NotFound extends React.Component {
  render () {
    return <div className="announce container">
      <h1>This page does not exist.</h1>
      <p> Why don't you check out some <Link to="/books">books</Link> instead?</p>
    </div>
  }
}

export default NotFound
