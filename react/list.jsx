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
import { Loadable, loadData } from './components/loader';

class Books extends Filterable {
  constructor(props, context) {
    super(props, context);

    this.state.loading = true;
    this.state.loaded = false;
    this.state.failed = false;
    this.state.data = {
      current: [],
      other: [],
    };

    this.refreshData = this.refreshData.bind(this);
  };

  refreshData() {
    const body = {
      tags: this.state.filter_tags,
      categories: this.state.filter_categories
    };
    loadData(this, () => fetch("/api/books", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body)
    }));
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
        <Loadable loading={this.state.loading} loaded={this.state.loaded} failed={this.state.failed}>
          {this.state.data.current.length > 0 &&
            <Panel>
              <h2>Currently Reading</h2>
              <BookList books={this.state.data.current} filterActions={filter_actions}/>
            </Panel>
          }
          {this.state.data.other.length > 0 &&
            <BookList books={this.state.data.other} filterActions={filter_actions} />
          }
        </Loadable>
      </div>
      <Filters tags={this.state.filter_tags} categories={this.state.filter_categories}
               removeTag={removeTag} removeCategory={removeCategory} />
    </div>
  }
}

export default Books
