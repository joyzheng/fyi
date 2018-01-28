from collections import defaultdict

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import Base
from .secondary_tables import categories_table


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String(128), unique=True, nullable=False)

    parent_id = Column(Integer, ForeignKey("categories.id"))
    parent = relationship("Category", remote_side="categories.c.id")

    books = relationship(
        "Book",
        secondary=categories_table,
        back_populates="categories",
    )

    @staticmethod
    def ancestors(session):
        all_categories = session.query(Category).all()
        names = {}
        for category in all_categories:
            names[category.id] = category.name

        parents = {}
        for category in all_categories:
            if category.parent_id is not None:
                parents[category.name] = names[category.parent_id]
            else:
                parents[category.name] = None

        category_ancestors = {}

        def calculate(name):
            if name in category_ancestors:
                return

            ancestors = set()
            ancestors.add(name)
            parent = parents[name]
            if parent:
                if parent not in category_ancestors:
                    calculate(parent)
                ancestors.update(category_ancestors[parent])
            category_ancestors[name] = ancestors

        for category in all_categories:
            calculate(category.name)

        return category_ancestors

    @staticmethod
    def children(session):
        all_categories = session.query(Category).all()
        names = {}
        for category in all_categories:
            names[category.id] = category.name

        children = defaultdict(list)
        for category in all_categories:
            if category.parent_id is not None:
                children[names[category.parent_id]].append(category.name)
            else:
                children["Books"].append(category.name)

        return children

    @staticmethod
    def tree_names(session, name):
        names = []

        to_process = (
            session
            .query(Category)
            .filter(Category.name == name)
            .all())
        while to_process:
            c = to_process.pop()
            names.append(c.name)

            to_process.extend(
                session
                .query(Category)
                .filter(Category.parent_id == c.id)
                .all()
            )

        return names


def _get(session, id, name, parent=None):
    res = session.query(Category).filter(Category.id == id).one()
    assert(res.name == name)
    return res


class All(object):
    def __init__(self, session):
        def get(*args, **kwargs):
            return _get(session, *args, **kwargs)

        # Nonfiction
        self.Nonfiction = get(id=0, name="Non-fiction")

        self.Art = get(id=35, name="Art", parent=self.Nonfiction)

        self.Biography = get(id=2, name="Biography", parent=self.Nonfiction)
        self.Autobiography = get(
            id=1, name="Autobiography", parent=self.Biography)
        self.Memoir = get(id=3, name="Memoir", parent=self.Biography)

        self.Business = get(id=28, name="Business", parent=self.Nonfiction)
        self.Education = get(id=34, name="Education", parent=self.Nonfiction)

        self.Food = get(id=4, name="Food", parent=self.Nonfiction)
        self.Cookbook = get(id=5, name="Cookbook", parent=self.Food)

        self.Ethics = get(id=7, name="Ethics", parent=self.Nonfiction)

        # How to categorize?
        self.History = get(
            id=8, name="History", parent=self.Nonfiction)
        self.Crime = get(id=27, name="Crime", parent=self.Nonfiction)
        self.HistoryAmerican = get(
            id=24, name="American History", parent=self.History)
        self.HistoryWar = get(id=30, name="War History", parent=self.History)

        self.World = get(
            id=46, name="World Studies", parent=self.Nonfiction)
        self.Europe = get(
            id=25, name="Europe", parent=self.World)
        self.Africa = get(
            id=40, name="Africa", parent=self.World)
        self.Asia = get(id=37, name="Asia", parent=self.World)
        self.China = get(id=33, name="China", parent=self.Asia)
        self.Russia = get(id=38, name="Russia", parent=self.World)
        self.Oceania = get(id=51, name="Oceania", parent=self.World)

        self.SocialScience = get(id=47, name="Social Sciences",
                                 parent=self.Nonfiction)
        self.Law = get(id=32, name="Law", parent=self.SocialScience)
        self.Politics = get(id=10, name="Politics", parent=self.SocialScience)
        self.Economics = get(id=6, name="Economics", parent=self.SocialScience)
        self.Sociology = get(id=48, name="Sociology",
                             parent=self.SocialScience)
        self.Anthropology = get(id=31, name="Anthropology",
                                parent=self.SocialScience)
        self.Philosophy = get(id=22, name="Philosophy",
                              parent=self.SocialScience)

        self.Gender = get(id=41, name="Gender", parent=self.Nonfiction)
        self.Race = get(id=49, name="Gender", parent=self.Nonfiction)

        self.Science = get(id=42, name="Science", parent=self.Nonfiction)
        self.Medicine = get(id=11, name="Medicine", parent=self.Science)
        self.Psychology = get(id=21, name="Psychology", parent=self.Science)

        self.Technology = get(id=13, name="Technology", parent=self.Nonfiction)
        self.ComputerScience = get(
            id=12, name="Computer Science", parent=self.Technology)

        self.Travel = get(id=29, name="Travel", parent=self.Nonfiction)

        self.Sports = get(id=52, name="Sports", parent=self.Nonfiction)

        # Fiction
        self.Fiction = get(id=14, name="Fiction")

        self.Literature = get(id=36, name="Literature", parent=self.Fiction)
        self.Classics = get(id=15, name="Classics", parent=self.Fiction)

        self.FictionHistorical = get(
            id=39, name="Historical Fiction", parent=self.Fiction)

        self.Mystery = get(id=16, name="Mystery", parent=self.Fiction)

        self.Suspense = get(
            id=43, name="Suspense & Thrillers", parent=self.Fiction)

        self.SciFi = get(id=17, name="Science Fiction", parent=self.Fiction)
        self.Fantasy = get(id=18, name="Fantasy", parent=self.Fiction)
        self.Dystopia = get(id=26, name="Dystopia", parent=self.Fiction)

        # Formats
        self.OtherFormat = get(id=50, name="Other Format")
        self.Essays = get(id=45, name="Essays", parent=self.OtherFormat)
        self.Short = get(id=23, name="Short Stories", parent=self.OtherFormat)
        self.Plays = get(id=44, name="Plays", parent=self.OtherFormat)

        # Misc
        self.Foreign = get(id=19, name="Foreign Language")
        self.French = get(id=20, name="French", parent=self.Foreign)
