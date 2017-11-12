from sqlalchemy import Column, Integer, String

from .base import Base


class Form(Base):
    __tablename__ = "forms"
    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String(128), unique=True, nullable=False)

    def __eq__(self, other):
        return self.id == other.id

    def __hash__(self):
        return hash(self.name)


def _get(session, id, name):
    res = session.query(Form).filter(Form.id == id).one()
    assert(res.name == name)
    return res


Ebook = Form(id=0, name="ebook")
Paper = Form(id=1, name="paper")
Audiobook = Form(id=2, name="audiobook")


class All(object):
    def __init__(self, session):
        def get(*args, **kwargs):
            return _get(session, *args, **kwargs)

        self.Ebook = get(id=0, name="ebook")
        self.Paper = get(id=1, name="paper")
        self.Audiobook = get(id=2, name="Audiobook")
