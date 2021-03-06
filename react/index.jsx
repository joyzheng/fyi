import React from 'react';
import ReactDOM from 'react-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import {
  Image,
  Nav,
  Navbar,
  NavItem
} from 'react-bootstrap';
import DocumentTitle from 'react-document-title';

import Home from './home';
import About from './about';
import Books from './books';
import Explore from './explore';
import List from './list';
import NotFound from './notfound';

class App extends React.Component {
  render () {
    return <BrowserRouter>
      <div>
        <Navbar inverse fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <LinkContainer to="/">
                <a>joy.fyi</a>
              </LinkContainer>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <LinkContainer to="/books">
                <NavItem>Books</NavItem>
              </LinkContainer>
              <LinkContainer to="/explore">
                <NavItem>Explore</NavItem>
              </LinkContainer>
              <LinkContainer to="/list">
                <NavItem>List</NavItem>
              </LinkContainer>
              <LinkContainer to="/about">
                <NavItem>About</NavItem>
              </LinkContainer>
            </Nav>
            <Nav pullRight>
              <NavItem href="https://github.com/joyzheng/fyi"><Image src="/static/github.png" alt="Github"/></NavItem>
              <NavItem href="https://twitter.com/joyzpanda"><Image src="/static/twitter.png" alt="Twitter"/></NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          {/* <Route exact path="/" component={Home}/>*/}
          <Redirect exact to="/books" from="/"/>
          <Route path="/books" component={Books}/>
          <Route path="/explore" component={Explore}/>
          <Route path="/list" component={List}/>
          <Route path="/about" component={About}/>
          <Route exact path="/404" component={NotFound}/>
          <Redirect to="/404"/>
        </Switch>
      </div>
    </BrowserRouter>
  }
}

ReactDOM.render(
  <DocumentTitle title="joy.fyi">
    <App />
  </DocumentTitle>,
  document.getElementById('app')
)
