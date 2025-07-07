import os
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
import pymongo
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "holiday_planner")

in_memory_db = {
    "users": [],
    "trips": []
}

using_mongodb = False
client = None
db = None

try:
    if MONGODB_URI:
        logger.info(f"Attempting to connect to MongoDB Atlas using URI: {MONGODB_URI[:20]}...")
        client = pymongo.MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        
        client.admin.command('ping')
        
        db = client[DB_NAME]
        users_collection = db.users
        trips_collection = db.trips
        
        logger.info("Successfully connected to MongoDB Atlas")
        using_mongodb = True
    else:
        logger.warning("No MONGODB_URI environment variable found")
        using_mongodb = False
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    logger.warning("Using in-memory storage as fallback")
    using_mongodb = False

def serialize_id(item):
    if isinstance(item, dict) and item.get("_id"):
        item_copy = dict(item)
        item_copy["id"] = str(item_copy["_id"])
        del item_copy["_id"]
        return item_copy
    return item

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TripBase(BaseModel):
    user_id: str
    trip_type: str  
    location: Optional[str] = None
    destination: Optional[str] = None
    budget: float
    people: int
    days: int
    group_type: str

class TripCreate(TripBase):
    data: Dict[str, Any]  

class TripResponse(TripBase):
    id: str
    data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

def find_user_by_email(email):
    try:
        if using_mongodb:
            user = users_collection.find_one({"email": email})
            return serialize_id(user) if user else None
        else:
            for user in in_memory_db["users"]:
                if user.get("email") == email:
                    return serialize_id(user)
            return None
    except Exception as e:
        logger.error(f"Error finding user by email: {e}")
        for user in in_memory_db["users"]:
            if user.get("email") == email:
                return serialize_id(user)
        return None

def insert_user(user_data):
    try:
        if using_mongodb:
            result = users_collection.insert_one(user_data)
            return str(result.inserted_id)
        else:
            user_id = str(ObjectId())
            user_data["_id"] = user_id
            in_memory_db["users"].append(user_data)
            return user_id
    except Exception as e:
        logger.error(f"Error inserting user: {e}")
        user_id = str(ObjectId())
        user_data["_id"] = user_id
        in_memory_db["users"].append(user_data)
        return user_id

def find_trip(trip_id, user_id=None):
    try:
        if using_mongodb:
            query = {"_id": ObjectId(trip_id)}
            if user_id:
                query["user_id"] = user_id
            trip = trips_collection.find_one(query)
            return serialize_id(trip) if trip else None
        else:
            for trip in in_memory_db["trips"]:
                if str(trip.get("_id")) == trip_id and (not user_id or trip.get("user_id") == user_id):
                    return serialize_id(trip)
            return None
    except Exception as e:
        logger.error(f"Error finding trip: {e}")
        for trip in in_memory_db["trips"]:
            if str(trip.get("_id")) == trip_id and (not user_id or trip.get("user_id") == user_id):
                return serialize_id(trip)
        return None

def find_trips_by_user(user_id):
    try:
        if using_mongodb:
            trips = list(trips_collection.find({"user_id": user_id}))
            return [serialize_id(trip) for trip in trips]
        else:
            return [serialize_id(trip) for trip in in_memory_db["trips"] if trip.get("user_id") == user_id]
    except Exception as e:
        logger.error(f"Error finding trips: {e}")
        return [serialize_id(trip) for trip in in_memory_db["trips"] if trip.get("user_id") == user_id]

def insert_trip(trip_data):
    try:
        if using_mongodb:
            result = trips_collection.insert_one(trip_data)
            return str(result.inserted_id)
        else:
            trip_id = str(ObjectId())
            trip_data["_id"] = trip_id
            in_memory_db["trips"].append(trip_data)
            return trip_id
    except Exception as e:
        logger.error(f"Error inserting trip: {e}")
        trip_id = str(ObjectId())
        trip_data["_id"] = trip_id
        in_memory_db["trips"].append(trip_data)
        return trip_id

def delete_trip(trip_id, user_id):
    try:
        if using_mongodb:
            result = trips_collection.delete_one({"_id": ObjectId(trip_id), "user_id": user_id})
            return result.deleted_count
        else:
            trip_index = next((i for i, trip in enumerate(in_memory_db["trips"]) 
                            if str(trip.get("_id")) == trip_id and trip.get("user_id") == user_id), -1)
            if trip_index >= 0:
                in_memory_db["trips"].pop(trip_index)
                return 1
            return 0
    except Exception as e:
        logger.error(f"Error deleting trip: {e}")
        trip_index = next((i for i, trip in enumerate(in_memory_db["trips"]) 
                        if str(trip.get("_id")) == trip_id and trip.get("user_id") == user_id), -1)
        if trip_index >= 0:
            in_memory_db["trips"].pop(trip_index)
            return 1
        return 0

document_to_dict = serialize_id
           
