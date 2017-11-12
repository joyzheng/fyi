from sqlalchemy import Column, Integer, String

from .base import Base


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String(128), unique=True, nullable=False)

    def __eq__(self, other):
        return self.id == other.id

    def __hash__(self):
        return hash(self.name)


def _get(session, id, name):
    res = session.query(Tag).filter(Tag.id == id).one()
    assert(res.name == name)
    return res


Unfinished = Tag(id=1, name="Unfinished")


class All(object):
    def __init__(self, session):
        def get(*args, **kwargs):
            return _get(session, *args, **kwargs)

        self.Recommended = get(id=0, name="Recommended")
        self.Unfinished = get(id=1, name="Unfinished")
