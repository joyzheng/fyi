import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  ButtonGroup,
  ProgressBar,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from 'recharts';

import { BookList } from './components/books';
import { Filterable } from './components/filters';


// TODO: extends filterable
class Stats extends Filterable {
  constructor(props, context) {
    super(props, context);

    this.state.loading = true;
    this.state.group = "month";
    this.state.cluster = 0;

    this.setGroup = this.setGroup.bind(this);
    this.refreshData = this.refreshData.bind(this);
  };

  setGroup(group) {
    this.setState({group: group});
  }

  componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(this.state.group, prevState.group) &&
          _.isEqual(this.state.filter_tags, prevState.filter_tags) &&
          _.isEqual(this.state.filter_categories, prevState.filter_categories))) {
      this.refreshData();
    }
  }

  refreshData() {
    const _this = this;
    _this.setState({loading: true});

    const body = {
      group: this.state.group,
      cluster: this.state.cluster,
      tags: this.state.filter_tags,
      categories: this.state.filter_categories
    };
    fetch("/api/stats", {
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
          _this.setState({
            series: result.series,
            data: result.data,
            loading: false,
          });
        }
      });
  }

  render() {
    const _this = this;
    const setGroup = this.setGroup;

    const clusterGroups = new Map();
    const clusters = [];
    const bars = [
      <XAxis dataKey="name"/>,
      <YAxis/>,
      <Tooltip cursor={false}/>
    ];
    let cluster = null;
    if (this.state.data != null) {
      for (let i = 0; i < this.state.series.length; i++) {
        let series = this.state.series[i];
        if (!clusterGroups.has(series.group)) {
          clusterGroups.set(series.group, []);
        }
        clusterGroups.get(series.group).push(
          <ToggleButton value={series.name}
                        onClick={function(){_this.setState({cluster: i})}}>
            {series.name}
          </ToggleButton>
        );
      }

      cluster = this.state.series[this.state.cluster];
      for (let [name, buttons] of clusterGroups) {
        clusters.push(
          <span>{name}: </span>
        );
        clusters.push(
          <ToggleButtonGroup type="radio" name={name}
                             // onChange doesn't work
                             value={cluster.group == name ? cluster.name : null}>
            {buttons}
          </ToggleButtonGroup>
        );
      }

      if (cluster.labels != null) {
        bars.push(<Legend/>);
      }
      for (let i = 0; i < cluster.keys.length; i++) {
        bars.push(
          <Bar name={cluster.labels && cluster.labels[i]}
               dataKey={cluster.keys[i]}
               fill={cluster.fill[i]}
               stackId="a"
               legendType="circle"/>
        );
      }
    }

    // TODO: use window size
    return <div>
      <div className="container">
        <h1>Reading Statistics</h1>
        {this.state.loading && this.state.data == null &&
          <div>
            <ProgressBar active now={100} label="Loading..."/>
          </div>
        }
        {this.state.data != null &&
          <div className="stats">
            <div className="filters buttons">
              <div>
                <span>Timeframe: </span>
                <ToggleButtonGroup type="radio" name="group"
                                   // onChange doesn't work
                                   value={_this.state.group}>
                  <ToggleButton value="week" onClick={function(){setGroup("week")}}>
                    By Week
                  </ToggleButton>
                  <ToggleButton value="month" onClick={function(){setGroup("month")}}>
                    By Month
                  </ToggleButton>
                  <ToggleButton value="year" onClick={function(){setGroup("year")}}>
                    By Year
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div>
                {clusters}
              </div>
            </div>

            {this.state.loading &&
              <div>
                <ProgressBar active now={100} label="Loading..."/>
              </div>
            }
            {!this.state.loading &&
              <div className="chart">
                <BarChart data={this.state.data}
                          width={650} height={300}>
                  {bars}
                </BarChart>
              </div>
            }
          </div>
        }
      </div>
    </div>
  }
}

export default Stats
