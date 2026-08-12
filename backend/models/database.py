# backend/models/database.py
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("AIVOA_Backend.Database")

# Fetch the PostgreSQL URL from the .env file
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    logger.critical("DATABASE_URL is missing from environment variables.")
    raise RuntimeError("Missing DATABASE_URL")

# Initialize the PostgreSQL engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency generator to yield a database session per request 
    and ensure it closes safely after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()