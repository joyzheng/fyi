import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Nav,
  Navbar
} from 'react-bootstrap';

class Filterable extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      filter_tags: [],
      filter_categories: [],
    };

    this.addTag = this.addTag.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.removeCategory = this.removeCategory.bind(this);
  };

  refreshData() {
    // implement in subclasses
  }

  componentDidMount() {
    this.refreshData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(this.state.filter_tags, prevState.filter_tags) &&
          _.isEqual(this.state.filter_categories, prevState.filter_categories))) {
      this.refreshData();
    }
  }

  addTag(value) {
    this.setState((prevState) => (
      this.state.filter_tags.indexOf(value) === -1 ?
      {
        filter_tags: prevState.filter_tags.concat([value])
      }
      : {}));
  }

  addCategory(value) {
    this.setState((prevState) => (
      this.state.filter_categories.indexOf(value) === -1 ?
      {
        filter_categories: this.state.filter_categories.concat([value])
      }
      : {}));
  }

  removeTag(value) {
    this.setState((prevState) => {
      const index = this.state.filter_tags.indexOf(value);
      if (index > -1) {
        const filter_tags = this.state.filter_tags.slice();
        filter_tags.splice(index, 1);
        return {filter_tags: filter_tags};
      }
      return {};
    });
  }

  removeCategory(value) {
    this.setState((prevState) => {
      const index = this.state.filter_categories.indexOf(value);
      if (index > -1) {
        const filter_categories = this.state.filter_categories.slice();
        filter_categories.splice(index, 1);
        return {filter_categories: filter_categories};
      }
      return {};
    });
  }
}

class Filters extends React.Component {
  render () {
    const removeTag = this.props.removeTag;
    const removeCategory = this.props.removeCategory;
    return <div>
      {(this.props.tags.length > 0 || this.props.categories.length > 0) &&
        <Navbar fixedBottom className="filters">
          <Navbar.Header>
            Filters
          </Navbar.Header>
          <Nav pullRight>
            {this.props.tags.map(function(tag, index){
              return <Button key={index} className="tag" onClick={function() {removeTag(tag)}}>
                {tag}
              </Button>;
            })}
            {this.props.categories.map(function(category, index){
              return <Button key={index} className="category" onClick={function() {removeCategory(category)}}>
                {category}
              </Button>;
            })}
          </Nav>
        </Navbar>
      }
    </div>
  }
}

export {
  Filterable,
  Filters,
}
