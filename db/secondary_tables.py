from sqlalchemy import Column, ForeignKey, Integer, Table

from .base import Base


authors_table = Table(
    'book_authors',
    Base.metadata,
    Column('book', Integer, ForeignKey('books.id'), primary_key=True),
    Column('author', Integer, ForeignKey('authors.id'), primary_key=True)
)


categories_table = Table(
    'book_categories',
    Base.metadata,
    Column('book', Integer, ForeignKey('books.id'), primary_key=True),
    Column('category', Integer, ForeignKey('categories.id'), primary_key=True)
)


tags_table = Table(
    'book_tags',
    Base.metadata,
    Column('book', Integer, ForeignKey('books.id'), primary_key=True),
    Column('tag', Integer, ForeignKey('tags.id'), primary_key=True)
)
