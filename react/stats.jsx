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
import { Loadable, loadData } from './components/loader';

class Stats extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
    this.state.loading = true;
    this.state.loaded = false;
    this.state.failed = false;
    this.state.group = "month";
    this.state.cluster = 0;
    this.state.data = {
      series: {},
      data: [],
    };

    this.setGroup = this.setGroup.bind(this);
    this.refreshData = this.refreshData.bind(this);
  };

  setGroup(group) {
    this.setState({group: group});
  }

  componentDidMount() {
    this.refreshData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state.group, prevState.group)) {
      this.refreshData();
    }
  }

  refreshData() {
    const body = {
      group: this.state.group,
      cluster: this.state.cluster,
    };
    loadData(this, () => fetch("/api/stats", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body)
    }));
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
    for (let i = 0; i < this.state.data.series.length; i++) {
      let series = this.state.data.series[i];
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

    cluster = this.state.data.series[this.state.cluster];
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

    if (cluster != null) {
      bars.push(<Legend/>);
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

    return <div>
      <div className="container">
        <h1>Reading Statistics</h1>
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
          <Loadable loading={this.state.loading} loaded={this.state.loaded} failed={this.state.failed}>
            <div className="chart">
              <BarChart data={this.state.data.data}
                        width={650} height={300}>
                {bars}
              </BarChart>
            </div>
          </Loadable>
        </div>
      </div>
    </div>
  }
}

export default Stats
