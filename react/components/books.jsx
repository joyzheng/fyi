import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
} from 'react-bootstrap';

class Book extends React.Component {
  render () {
    let title = this.props.title;
    if (this.props.subtitle != null) {
      title = title + ": " + this.props.subtitle;
    }

    const addTag = this.props.filterActions.addTag;
    const addCategory = this.props.filterActions.addCategory;

    const tags = this.props.tags.map(function(tag, index){
      return <Button key={index} className="tag" onClick={function () {addTag(tag)}}>
        {tag}
      </Button>;
    });
    const categories = this.props.categories.map(function(category, index){
      return <Button key={index} className="category" onClick={function () {addCategory(category)}}>
        {category}
      </Button>;
    });

    return <div className="book">
      <p>
        <span className="title">
          {title}
        </span>
        <span className="tags">
          {tags}
          {categories}
        </span>
        <span className="author">
          {this.props.authors.join(", ")} ({this.props.year})
        </span>
      </p>
    </div>
  }
}

class BookList extends React.Component {
  render () {
    const filterActions = this.props.filterActions;
    const books = this.props.books.map(function(book, index){
      return <Book key={book.id} {...book} filterActions={filterActions}/>;
    })
    const list = [books[0]]
    for (let i = 1; i < books.length; i++) {
      list.push(<hr key={-1 * i}/>)
      list.push(books[i])
    }

    return <div>
      {list}
    </div>
  }
}

class BookDescriptor extends React.Component {
  render() {
    return <p>
      The books here are not comprehensive, but include most of what I've
      read starting from mid-2008.
      I've included anything particularly good or
      thought-provoking; I've also included books I didn't particularly
      like.
    </p>
  }
}

export {
  BookDescriptor,
  BookList,
  Book,
}
