import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Button,
  ButtonGroup,
  Panel,
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
        <h3>{this.props.title}</h3>
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
    for (let j = 0; j < names.length; j++) {
      for (let i = 0; i < this.props.series.length; i++) {
        let series = this.props.series[i];
        if (series.name == names[j]) {
          clusters.push(series);
        }
      }
    }
    return clusters
  }

  render() {
    return <div>
      <p>[Stats are always up-to-date. Commentary last updated January 2018.]</p>
      <div>
        <StatsBarChart
            title="Reading Rate"
            series={this.clusters(["Started", "Completed"])}
            data={this.props.data}>
          <p>
            I average around 2 books per week, although a
            weekend reading marathon easily overtakes that number.
            I've long since reached the point where I skim almost
            every book I read (and can't actually stop
            myself from skimming) and reread the books I want to
            revisit.
          </p>
        </StatsBarChart>
      </div>
      <hr/>

      <div>
        <StatsBarChart
            title="Who I'm Reading"
            series={this.clusters(["Gender", "POC"])}
            data={this.props.data}>
          <p>
            One of my goals in starting to track books read was
            also to track which authors<sup>[<a href="#fn2" id="ref2">2</a>]</sup> I was reading.
          </p>
          <p>
            Surprisingly, 2017 came out as an even split between male and
            female authors: I was expecting a really skewed ratio.
            I suspect that was aided by a bump in the amount I read on
            femnism and gender studies, though -- more to come on a breakdown
            of authors by book category (e.g. fiction vs. nonfiction).
          </p>
          <p>
            I need to do better at reading more works by people of color.
          </p>
          <p>
            More to come as well on author nationality -- I have some of the
            data compiled already but need to figure out how to display it.
          </p>
        </StatsBarChart>
      </div>
      <hr/>

      <div>
        <StatsBarChart
            title="Length"
            series={this.clusters(["Length"])}
            data={this.props.data}>
          <p>
            My preference is either for long<sup>[<a href="#fn3" id="ref3">3</a>]</sup> novels
            or fairly lengthy nonfiction books. Occasionally I read short stories, novellas, or
            essays. I'm not much of a poetry fan (and read very little of it).
          </p>
        </StatsBarChart>
      </div>
      <hr/>

      <div>
        <StatsBarChart
            title="Format"
            series={this.clusters(["Format"])}
            data={this.props.data}>
          <p>
            Almost all of my reading is on Kindle, if for no other reason than carting around
            this many books in and out of dorm rooms became annoying, and Kindle makes it
            possible to buy a book at midnight when it's released, instead of having to go
            to a bookstore the next day. I do still prefer to have some slower reads (e.g.
            long nonfiction books) in paperback.
          </p>
        </StatsBarChart>
      </div>
    </div>;
  }
}

class Books extends React.Component {
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
        <h1>Books</h1>
        <Panel>
          <p>What I believe:</p>
          <ul>
            <li>What and who we read matters.</li>
            <li>Diversity of reading is important.</li>
            <li>Representation among who we read is important.</li>
          </ul>
        </Panel>
        <p>
          I've wanted to build a queryable database of books and authors
          I've read for a long time.
          Following the 2016 election, I wanted a
          better answer to the question of who and what I had been
          reading (and a way to measure change over time), so I finally sat
          down in mid-2017 and started going through the list.
        </p>
        <p>
          The result is a catalogue of most of the books I've read since
          buying a Kindle in 2008.
          Keep reading for some commentary and statistics below.
          Otherwise, to jump directly to the books, you
          can <LinkContainer to="/explore"><a>explore</a></LinkContainer> by
          category or view
          the <LinkContainer to="/list"><a>full list</a></LinkContainer>.
        </p>
        <hr/>
        <div className="header">
          <div className="filters buttons">
            <span>Timeframe<sup>[<a href="#fn1" id="ref1">1</a>]</sup>: </span>
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
          <h2>Stats</h2>
        </div>
        <Loadable loading={this.state.loading} loaded={this.state.loaded} failed={this.state.failed}>
          <StatsWriting series={this.state.data.series} data={this.state.data.data}/>
        </Loadable>
        <hr/>
        <div className="fn">
          <p>
            <sup>[<a href="#ref1" id="fn1">1</a>]</sup>Except for the graph of books by date started,
            the remaining stats count only books finished, according to the date that
            I finished reading them.
          </p>
          <p>
            <sup>[<a href="#ref2" id="fn2">2</a>]</sup>Books with n authors count each author as 1/n
            in the author statistics, to avoid skewing the numbers towards books with a larger number
            of authors (which also tend to be nonfiction).
          </p>
          <p>
            <sup>[<a href="#ref3" id="fn3">3</a>]</sup>Page count can vary a lot by print format; where
            possible, this uses the Kindle page length on the Amazon book page to try to compare apples-to-apples
            as much as possible. I've generally excluded endnotes from page counts since I rarely read
            endnotes.
          </p>
        </div>
      </div>
    </div>;
  }
}

export default Books
