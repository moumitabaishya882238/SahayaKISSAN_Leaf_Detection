from pymongo import MongoClient
from app.config import MONGO_URL,DB_NAME

client=MongoClient(MONGO_URL)
db=client[DB_NAME]

users=db.users
chat_sessions=db.chat_sessions
messages=db.messages