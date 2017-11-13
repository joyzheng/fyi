import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Button,
  Panel,
  ProgressBar
} from 'react-bootstrap';
import {
  Tree,
} from 'react-d3-tree';

import { BookDescriptor, BookList } from './components/books';
import { Filterable, Filters } from './components/filters';
import { Loadable, loadData } from './components/loader';

class BooksTree extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      translate: {x: 20, y: 0},
    };
  };

  componentDidMount() {
    const dimensions = this.treeContainer.getBoundingClientRect();
    this.setState({
      translate: {
        x: 20,
        y: dimensions.height / 2,
      },
    });
  }

  render() {
    let categoryCount = 0;
    if (this.props.categories.length > 0) {
      const doCount = (node) => {
        let count = 1;
        for (let i = 0; i < node.children.length; i++) {
          count += doCount(node.children[i]);
        }
        return count;
      }

      categoryCount = doCount(this.props.categories[0]);
    }

    const onClick = (node) => {
      if (node.name === "Books") {
        return;
      }
      this.props.addCategory(node.name);
    };
    return <Panel className="right"><div ref={tc => this.treeContainer = tc}>
      <Tree
        data={this.props.categories}
        initialDepth={categoryCount < 20 ? undefined : 2}
        translate={this.state.translate}
        nodeSize={{x: 100, y: 15}}
        textLayout={{textAnchor: "start", x: 10, y: 0}}
        scaleExtent={{min: 1, max: 2}}
        nodeSvgShape={{
          shape: 'circle',
          shapeProps: {
            r: 5,
            stroke: "#333",
            fill: "#9d9d9d",
          }
        }}
        onClick={onClick}
        collapsible={false}
        styles={{
          links: {
            stroke: "#9d9d9d",
          },
        }}
      />
    </div></Panel>
  }
}

class Explore extends Filterable {
  constructor(props, context) {
    super(props, context);

    this.state.loading = true;
    this.state.loaded = false;
    this.state.failed = false;
    this.state.data = {
      current: [],
      other: [],
      categories: [],
    };
    this.state.current = [];
    this.state.other = [];

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
        <h1>Explore</h1>
        <BookDescriptor/>
        <p>
          Explore using the category tree on the right and the
          tags at the bottom, or
          go <LinkContainer to="/list"><a>here</a></LinkContainer> for
          a list without the tree.
        </p>
        <Loadable loading={this.state.loading} loaded={this.state.loaded} failed={this.state.failed}>
          <BooksTree categories={this.state.data.categories} addCategory={this.addCategory}/>
          <hr/>
          <BookList books={this.state.data.current.concat(this.state.data.other)} filterActions={filter_actions} />
        </Loadable>
      </div>
      <Filters tags={this.state.filter_tags} categories={this.state.filter_categories}
               removeTag={removeTag} removeCategory={removeCategory} />
    </div>
  }
}

export default Explore
