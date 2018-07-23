import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Image,
  Panel
} from 'react-bootstrap';
import DocumentTitle from 'react-document-title';

class About extends React.Component {
  render () {
    return <DocumentTitle title="joy.fyi | About"><div className="container main">
      <panel>
        <Image className="center-block" src="/static/panda.png" alt="Panda" circle responsive/>
        <div>
          <p>
            Engineering manager <a href="https://twitter.com/plaid">@plaid</a>.
            <br/>
            Previously software engineer <a href="https://twitter.com/vessel">@vessel</a>,
              intern <a href="https://twitter.com/dropbox">@dropbox</a> and <a href="https://twitter.com/addepar">@addepar</a>.
          </p>
          <p>
            You can email <a href="mailto:me@joy.fyi">{"me@{this domain\}"}</a> or find me at one of links in the top bar.
            <br/>
            I'm always looking for book recommendations.
          </p>
        </div>
      </panel>
    </div></DocumentTitle>
  }
}

export default About
