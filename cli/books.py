from db import Book


def get_book(session, title):
    books = session.query(Book).filter(Book.title == title).all()
    if len(books) == 0:
        raise Exception('No books found with title "{}"'.format(title))
    elif len(books) > 1:
        raise Exception(
            'Multiple books found with title "{}"'.format(title))
    return books[0]
