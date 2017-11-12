import React from 'react';
import ReactDOM from 'react-dom';
import {
  ProgressBar
} from 'react-bootstrap';

function loadData(component, request) {
  component.setState({loading: true})
  return request()
    .then(
      function(response) {
        if (response.ok) {
          return response.json();
        }
      },
      function(error) {
        return null;
      }
    )
    .then(function(result) {
      if (result != null) {
        component.setState({loaded: true, loading: false, failed: false, data: result});
      } else {
        component.setState({loading: false, failed: true});
      }
    });
}

class Loadable extends React.Component {
  render () {
    const children = [];

    if (this.props.failed) {
      children.push(<div>
        <ProgressBar className="failed" striped now={100} label="Loading failed"/>
      </div>);
    } else if (this.props.loading) {
      children.push(<div>
        <ProgressBar active now={100} label="Loading..."/>
      </div>);
    }

    if (this.props.loaded) {
      if (Array.isArray(this.props.children)) {
        children.push(...this.props.children);
      } else {
        children.push(this.props.children);
      }
    }

    return <div>{children}</div>;
  };
}

export {
  Loadable,
  loadData,
}
