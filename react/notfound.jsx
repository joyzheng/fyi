import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';

class NotFound extends React.Component {
  render () {
    return <DocumentTitle title="joy.fyi | Not Found"><div className="announce container">
      <h1>This page does not exist.</h1>
      <p> Why don't you check out some <Link to="/books">books</Link> instead?</p>
    </div></DocumentTitle>
  }
}

export default NotFound
