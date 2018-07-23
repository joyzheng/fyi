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
import DocumentTitle from 'react-document-title';

import { BookDescriptor, BookList } from './components/books';
import { Filterable, Filters } from './components/filters';
import { Loadable, loadData } from './components/loader';

const TreeProps = {
  nodeSize: {x: 100, y: 15},
  textLayout: {textAnchor: "start", x: 10, y: 0},
  scaleExtent: {min: 1, max: 2},
  translate: {x: 20, y: 0},
  nodeSvgShape: {
    shape: 'circle',
    shapeProps: {
      r: 5,
      stroke: "#333",
      fill: "#9d9d9d",
    }
  },
  styles: {
    links: {
      stroke: "#9d9d9d",
    },
  },
};

class BooksTree extends React.PureComponent {
  constructor(props, context) {
    super(props, context);

    this.onClick = this.onClick.bind(this);
    this.setTreeContainer = this.setTreeContainer.bind(this);

    this.state = {
      translate: TreeProps.translate,
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

  setTreeContainer(tc) {
    this.treeContainer = tc;
  }

  onClick(node) {
    if (node.name === "Books") {
      return;
    }
    this.props.addCategory(node.name);
  };

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

    return <Panel className="right"><div ref={this.setTreeContainer}>
      <Tree
        data={this.props.categories}
        initialDepth={categoryCount < 20 ? undefined : 2}
        translate={this.state.translate}
        nodeSize={TreeProps.nodeSize}
        textLayout={TreeProps.textLayout}
        scaleExtent={TreeProps.scaleExtent}
        nodeSvgShape={TreeProps.nodeSvgShape}
        onClick={this.onClick}
        collapsible={false}
        styles={TreeProps.styles}
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
      tags: this.tags(),
      categories: this.categories(),
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

    return <DocumentTitle title="joy.fyi | Explore Books"><div>
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
          <BooksTree key={"tree"} categories={this.state.data.categories} addCategory={this.addCategory}/>
          <hr/>
          <BookList books={this.state.data.current.concat(this.state.data.other)} filterActions={filter_actions} />
        </Loadable>
      </div>
      <Filters tags={this.tags()} categories={this.categories()}
               removeTag={removeTag} removeCategory={removeCategory} />
    </div></DocumentTitle>
  }
}

export default Explore
