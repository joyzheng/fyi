import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Panel,
  ProgressBar
} from 'react-bootstrap';

import { BookDescriptor, BookList } from './components/books';
import { Filterable, Filters } from './components/filters';

class Books extends Filterable {
  constructor(props, context) {
    super(props, context);

    this.state.loading = true;
    this.state.current = [];
    this.state.other = [];

    this.refreshData = this.refreshData.bind(this);
  };

  refreshData() {
    const _this = this;
    _this.setState({loading: true});

    const body = {
      tags: this.state.filter_tags,
      categories: this.state.filter_categories
    };
    fetch("/api/books", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body)
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        console.error("Request failed");
      })
      .then(function(result) {
        if (result != null) {
          _this.setState(result);
          _this.setState({loading: false});
        }
      });
  }

  render() {
    const filter_actions = {
      addTag: this.addTag,
      addCategory: this.addCategory,
    };
    const removeTag = this.removeTag;
    const removeCategory = this.removeCategory;

    return <div>
      <div className="container">
        <h1>Books</h1>
        <BookDescriptor/>
        <p>
          Favorite books are tagged with
            <Button className="tag" onClick={function() {filter_actions.addTag("Recommended")}}>
              Recommended
            </Button>.
        </p>
        {this.state.loading &&
          <div>
            <ProgressBar active now={100} label="Loading..."/>
          </div>
        }
        {!this.state.loading && this.state.current.length > 0 &&
          <Panel>
            <h2>Currently Reading</h2>
            <BookList books={this.state.current} filterActions={filter_actions}/>
          </Panel>
        }
        {!this.state.loading && this.state.other.length > 0 &&
          <BookList books={this.state.other} filterActions={filter_actions} />
        }
      </div>
      <Filters tags={this.state.filter_tags} categories={this.state.filter_categories}
               removeTag={removeTag} removeCategory={removeCategory} />
    </div>
  }
}

export default Books
