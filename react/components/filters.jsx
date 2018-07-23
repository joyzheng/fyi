import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Nav,
  Navbar
} from 'react-bootstrap';
import qs from 'qs';

class Filterable extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
    this.tags = this.tags.bind(this);
    this.categories = this.categories.bind(this);
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
    if (!(_.isEqual(this.categories(), this.categories(prevProps.location)) &&
          _.isEqual(this.tags(), this.tags(prevProps.location)))) {
      this.refreshData();
    }
  }

  categories(location) {
    if (location == null) {
      location = this.props.location;
    }
    return qs.parse(location.search, { ignoreQueryPrefix: true }).categories || [];
  }

  tags(location) {
    if (location == null) {
      location = this.props.location;
    }
    return qs.parse(location.search, { ignoreQueryPrefix: true }).tags || [];
  }

  addTag(value) {
    const currentTags = this.tags();
    if (currentTags.indexOf(value) === -1) {
      this.props.history.push({
        pathname: this.props.location.pathname,
        search: qs.stringify({
          categories: this.categories(),
          tags: currentTags.concat([value]),
        }),
      }, { addQueryPrefix: true, encodeValuesOnly: true });
    }
  }

  addCategory(value) {
    const currentCategories = this.categories();
    if (currentCategories.indexOf(value) === -1) {
      this.props.history.push({
        pathname: this.props.location.pathname,
        search: qs.stringify({
          categories: currentCategories.concat([value]),
          tags: this.tags(),
        }),
      }, { addQueryPrefix: true, encodeValuesOnly: true });
    }
  }

  removeTag(value) {
    const currentTags = this.tags();
    const index = currentTags.indexOf(value);
    if (index > -1) {
      currentTags.splice(index, 1);
      this.props.history.push({
        pathname: this.props.location.pathname,
        search: qs.stringify({
          categories: this.categories(),
          tags: currentTags,
        }),
      }, { addQueryPrefix: true, encodeValuesOnly: true });
    }
  }

  removeCategory(value) {
    const currentCategories = this.categories();
    const index = currentCategories.indexOf(value);
    if (index > -1) {
      currentCategories.splice(index, 1);
      this.props.history.push({
        pathname: this.props.location.pathname,
        search: qs.stringify({
          categories: currentCategories,
          tags: this.tags(),
        }),
      }, { addQueryPrefix: true, encodeValuesOnly: true });
    }
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
