import argparse

from datetime import datetime

from db import Book, Category, Session
from db import tags as tags_raw

from cli.authors import get_or_create_author
from cli.books import get_book
from cli.series import get_or_create_series
from cli.utils import (
    prompt_named_options,
)


def add(args):
    session = Session()
    tags = tags_raw.All(session)

    if len(args.first) != len(args.last):
        raise Exception(
            'Must have same number of first and last names')

    authors = []
    for first, last in zip(args.first, args.last):
        author = get_or_create_author(session, first, last)
        authors.append(author)

    args.categories = args.categories.split(',')
    categories = session.query(Category).filter(
        Category.name.in_(args.categories)).all()
    if len(categories) != len(args.categories):
        found = [category.name for category in categories]
        raise Exception('Failed to find categories {}'.format(
            [c for c in args.categories if c not in found]))

    book = Book(
        title=args.title,
        subtitle=args.subtitle,
        amazon_id=args.amzn,
        authors=authors,
        categories=categories,
        acquired_at=datetime.utcnow(),
        started_at=datetime.utcnow(),
        published=args.year,
        pages=args.length,
    )

    if args.recommend:
        tags = tags_raw.All(session)
        book.tags.append(tags.Recommended)
    if args.finished:
        book.finished_at = datetime.utcnow()
    if args.series:
        series, series_number = get_or_create_series(session, args.series)
        book.series = series
        book.series_number = series_number
    if args.finished_at:
        book.finished_at = datetime.strptime(args.finished_at, "%m/%d/%y")
    if args.started_at:
        book.acquired_at = datetime.strptime(args.started_at, "%m/%d/%y")
        book.started_at = datetime.strptime(args.started_at, "%m/%d/%y")

    book.form = prompt_named_options('Form?', {
        'ebook': ['e'],
        'paper': ['p'],
        'audiobook': ['a'],
    })

    session.add(book)
    session.commit()


def mark_unfinished(args):
    session = Session()

    book = get_book(session, args.title)
    tags = tags_raw.All(session)
    book.tags.append(tags.Unfinished)

    session.commit()


def finish(args):
    session = Session()

    book = get_book(session, args.title)
    book.finished_at = datetime.utcnow()
    if args.recommend:
        tags = tags_raw.All(session)
        book.tags.append(tags.Recommended)

    session.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(help='sub-command help')

    parser_finish = subparsers.add_parser('mark_unfinished',
                                          help='mark book as unfinished')
    parser_finish.add_argument('title', type=str, help='Title of book')
    parser_finish.set_defaults(func=mark_unfinished)

    parser_finish = subparsers.add_parser('finish',
                                          help='mark book as finished')
    parser_finish.add_argument('title', type=str, help='Title of book')
    parser_finish.add_argument('--recommend', action='store_true')
    parser_finish.set_defaults(func=finish)

    parser_add = subparsers.add_parser('add', help='add new book')
    parser_add.add_argument('title', type=str, help='Title of book')
    parser_add.add_argument('--subtitle', type=str, help='Subtitle of book')
    parser_add.add_argument('--series', type=str, help='Series title')
    parser_add.add_argument('--first', type=str, help='Author first name',
                            required=True, action='append')
    parser_add.add_argument('--last', type=str, help='Author last name',
                            required=True, action='append')
    parser_add.add_argument('--amzn', type=str, help='Amazon ID',
                            required=True)
    parser_add.add_argument('--year', type=int, help='Year of publication',
                            required=True)
    parser_add.add_argument('--length', type=int, help='Number of pages',
                            required=True)
    parser_add.add_argument('--categories', type=str, required=True)
    parser_add.add_argument('--finished', action='store_true')
    parser_add.add_argument('--recommend', action='store_true')
    parser_add.add_argument('--started_at', type=str)
    parser_add.add_argument('--finished_at', type=str)
    parser_add.set_defaults(func=add)

    args = parser.parse_args()
    args.func(args)
