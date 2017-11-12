from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship


from .base import Base
from .forms import Form
from .tags import Tag

from .secondary_tables import (
    authors_table,
    categories_table,
    tags_table,
)


class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True)
    first = Column(String(128))
    last = Column(String(128), nullable=False)
    gender = Column(String(8), nullable=False)
    nationality = Column(String(32), nullable=False)
    poc = Column(Boolean, nullable=False)

    books = relationship(
        "Book",
        secondary=authors_table,
        back_populates="authors",
    )


class Series(Base):
    __tablename__ = "series"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False)
    comment = Column(String(256))
    description = Column(String(2048))


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(String(128), nullable=False)
    subtitle = Column(String(256))

    amazon_id = Column(String(128), nullable=False)

    comment = Column(String(256))
    description = Column(String(2048))

    pages = Column(Integer, nullable=False)

    authors = relationship(
        "Author",
        secondary=authors_table,
        back_populates="books",
        lazy="joined",
    )
    categories = relationship(
        "Category",
        secondary=categories_table,
        back_populates="books",
        lazy="joined",
    )
    tags = relationship(
        Tag,
        secondary=tags_table,
        lazy="joined",
    )

    form = Column(String(128), ForeignKey(Form.name), nullable=False)

    # pages = Column(Integer, nullable=False)

    series_id = Column(Integer, ForeignKey(Series.id))
    series_number = Column(Integer)
    series = relationship(Series, backref="books", foreign_keys=[series_id])

    published = Column(Integer, nullable=False)

    acquired_at = Column(
        DateTime, nullable=False, default=datetime.now, index=True)
    started_at = Column(DateTime)
    finished_at = Column(DateTime)

    def author_names(self):
        res = []
        for author in self.authors:
            if author.first:
                res.append(author.first + " " + author.last)
            else:
                res.append(author.last)
        return res

    def json(self):
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "authors": self.author_names(),
            "year": self.published,
            "categories": [category.name for category in self.categories],
            "tags": [tag.name for tag in self.tags],
        }
