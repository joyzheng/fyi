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

class StatsBarChart extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      cluster: 0,
    };
  };

  render() {
    const _this = this;

    const buttons = [];
    const bars = [
      <XAxis dataKey="name"/>,
      <YAxis/>,
      <Tooltip cursor={false}/>
    ];
    let cluster = null;
    for (let i = 0; i < this.props.series.length; i++) {
      let series = this.props.series[i];
      buttons.push(
        <ToggleButton value={series.name}
                      onClick={function(){_this.setState({cluster: i})}}>
          {series.name}
        </ToggleButton>
      );
    }

    cluster = this.props.series[this.state.cluster];
    if (cluster != null) {
      bars.push(<Legend/>);
      for (let i = 0; i < cluster.keys.length; i++) {
        bars.push(
          <Bar name={cluster.labels[i]}
               dataKey={cluster.keys[i]}
               fill={cluster.fill[i]}
               stackId="a"
               legendType="circle"/>
        );
      }
    }

    return <div>
      <div className="header">
        <div className="filters buttons">
          <ToggleButtonGroup type="radio" name="group" value={cluster.name}>
            {buttons}
          </ToggleButtonGroup>
        </div>
        <h2>{this.props.title}</h2>
      </div>
      <div className="chart">
        <BarChart data={this.props.data}
                  width={650} height={300}>
          {bars}
        </BarChart>
      </div>
      <div>
        {this.props.children}
      </div>
    </div>
  }
}

class StatsWriting extends React.Component {
  clusters(names) {
    const clusters = [];
    for (let i = 0; i < this.props.series.length; i++) {
      let series = this.props.series[i];
      if (names.includes(series.name)) {
        clusters.push(series);
      }
    }

    return clusters
  }

  render() {
    return <div>
      <div>
        <StatsBarChart
            title="Over Time"
            series={this.clusters(["Started", "Completed"])}
            data={this.props.data}>
          <p>Some text here</p>
        </StatsBarChart>
      </div>
      <hr/>

      <div>
        <StatsBarChart
            title="Authors"
            series={this.clusters(["Gender", "POC"])}
            data={this.props.data}>
          <p>Some text here</p>
        </StatsBarChart>
      </div>
      <hr/>

      <div>
        <StatsBarChart
            title="Length"
            series={this.clusters(["Length"])}
            data={this.props.data}>
          <p>Some text here</p>
        </StatsBarChart>
      </div>
      <hr/>

      <div>
        <StatsBarChart
            title="Format"
            series={this.clusters(["Format"])}
            data={this.props.data}>
          <p>Some text here</p>
        </StatsBarChart>
      </div>
    </div>;
  }
}

class Stats extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
    this.state.loading = true;
    this.state.loaded = false;
    this.state.failed = false;
    this.state.group = "month";
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
    return <div>
      <div className="container">
        <div className="header">
          <div className="filters buttons">
            <span>Timeframe: </span>
            <ToggleButtonGroup type="radio" name="group"
                               // onChange doesn't work
                               value={_this.state.group}>
              <ToggleButton value="week" onClick={function(){setGroup("week")}}>
                Recent
              </ToggleButton>
              <ToggleButton value="month" onClick={function(){setGroup("month")}}>
                Past Year
              </ToggleButton>
              <ToggleButton value="year" onClick={function(){setGroup("year")}}>
                All-Time
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <h1>Reading Statistics</h1>
        </div>
        <Loadable loading={this.state.loading} loaded={this.state.loaded} failed={this.state.failed}>
          <StatsWriting series={this.state.data.series} data={this.state.data.data}/>
        </Loadable>
      </div>
    </div>;
  }
}

export default Stats
