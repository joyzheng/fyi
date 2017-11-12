import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

class Home extends React.Component {
  render () {
    return <div className="announce">
      <h1>Coming <del>Soon</del> Eventually</h1>
      <p> Why don't you check out some <Link to="/books">books</Link> instead?</p>
    </div>
  }
}

export default Home
