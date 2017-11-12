from sqlalchemy import desc
from sqlalchemy.sql import func

from .books import Book
from .categories import Category


def query_books(session, tags, categories):
    books = session.query(Book).order_by(desc(
        func.coalesce(Book.finished_at,
                      Book.started_at,
                      Book.acquired_at))).all()

    tags = set(tags)
    categories = [set(Category.tree_names(session, category))
                  for category in categories]

    def matches(book):
        book_tags = set(tag.name for tag in book.tags)
        if tags and not tags.issubset(book_tags):
            return False

        book_categories = set(c.name for c in book.categories)
        for category_tree in categories:
            if category_tree.isdisjoint(book_categories):
                return False

        return True

    return filter(matches, books)
