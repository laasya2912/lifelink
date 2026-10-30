import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "lifelink_db")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is missing from the .env file")

mongo_client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000
)

database = mongo_client[MONGODB_DATABASE]
incidents_collection = database["incidents"]