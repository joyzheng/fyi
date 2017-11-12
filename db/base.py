import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


Base = declarative_base()

engine = create_engine(os.environ["SQLALCHEMY_DATABASE_URI"],
                       pool_pre_ping=True)
Session = sessionmaker(bind=engine, autoflush=False)
