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
    const doCount = (node) => {
      let count = 1;
      for (let i = 0; i < node.children.length; i++) {
        count += doCount(node.children[i]);
      }
      return count;
    }

    const onClick = (node) => {
      if (node.name === "Books") {
        return;
      }
      this.props.addCategory(node.name);
    };
    return <Panel className="right"><div ref={tc => this.treeContainer = tc}>
      <Tree
        data={[this.props.categories]}
        initialDepth={doCount(this.props.categories) < 20 ? undefined : 2}
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

class Books extends Filterable {
  constructor(props, context) {
    super(props, context);

    this.state.loaded = false;
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
          _this.setState({loaded: true, loading: false});
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
        <h1>Explore</h1>
        <BookDescriptor/>
        <p>
          Explore using the category tree on the right and the
          tags at the bottom, or
          go <LinkContainer to="/list"><a>here</a></LinkContainer> for
          a list without the tree.
        </p>
        {this.state.loading &&
          <div>
            <ProgressBar active now={100} label="Loading..."/>
          </div>
        }
        {this.state.loaded &&
          <BooksTree categories={this.state.categories} addCategory={this.addCategory}/>
        }
        {this.state.loaded && <hr/>}
        {this.state.loaded &&
          <BookList books={this.state.current.concat(this.state.other)} filterActions={filter_actions} />
        }
      </div>
      <Filters tags={this.state.filter_tags} categories={this.state.filter_categories}
               removeTag={removeTag} removeCategory={removeCategory} />
    </div>
  }
}

export default Books
