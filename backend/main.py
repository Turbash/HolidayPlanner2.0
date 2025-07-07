from fastapi import FastAPI, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, List
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import os
import json
import re
import random
import requests
from enum import Enum
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import logging

from database import (
    UserResponse as User, 
    UserCreate, UserLogin, Token, 
    TripResponse as Trip,
    TripCreate,
    find_user_by_email, insert_user, find_trip, find_trips_by_user,
    insert_trip, delete_trip, using_mongodb, serialize_id
)
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_ID = os.getenv("MODEL_ID")
API_KEY = os.getenv("WEATHERAPI_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GroupType(str,Enum):
    friends="friends"
    couple="couple"
    family="family"
    solo="solo"

client = InferenceClient(model=MODEL_ID, token=HF_API_TOKEN)
def ai_huggingface(prompt):
    messages = [{"role": "user", "content": prompt}]
    response =client.chat.completions.create(messages)
    return response.choices[0].message.content

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Holiday Planner API"}

@app.get("/weather/{city}")
async def get_weather(city: str, days: int = 5):
    """
    Fetch weather forecast for a city using weatherapi.com.
    """
    try:
        if not API_KEY:
            return {"error": "Weather API key not set"}
        days = min(days, 14)
        url = f"https://api.weatherapi.com/v1/forecast.json"
        params = {
            "key": API_KEY,
            "q": city,
            "days": days,
            "aqi": "no",
            "alerts": "no"
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            return {"error": f"Failed to fetch weather: {response.text}"}
        return response.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    try:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        existing_user = find_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        now = datetime.utcnow()
        new_user = {
            "email": user_data.email,
            "name": user_data.name,
            "hashed_password": get_password_hash(user_data.password),
            "created_at": now,
            "updated_at": now,
            "is_active": True
        }
        user_id = insert_user(new_user)
        new_user["_id"] = user_id
        user = serialize_id(new_user)
        del user["hashed_password"]
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to server error. Please try again later."
        )

@app.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def read_users_me(current_user = Depends(get_current_active_user)):
    user = dict(current_user)
    if "hashed_password" in user:
        del user["hashed_password"]
    return user

@app.post("/api/suggestions", status_code=status.HTTP_200_OK)
async def suggest_destinations(
    location: Annotated[str, Body()],
    budget: Annotated[float, Body()],
    people: Annotated[int, Body()],
    days: Annotated[int, Body()],
    group_type: Annotated[GroupType, Body()],
    current_user = Depends(get_current_active_user)
):
    date = datetime.now().strftime("%Y-%m-%d")
    prompt_suggest_template = f"""
    You are a travel assistant specializing in budget-conscious travel recommendations. Based on the user's location ({location}), STRICT budget (${budget}), number of people ({people}), group type ({group_type}), number of days ({days}), and starting date ({date}), suggest destinations that are specifically tailored to these parameters.

    BUDGET CONSTRAINTS ARE CRITICAL:
    - Only suggest destinations that are realistic to visit with ${budget} for {people} people for {days} days
    - Consider flight/transportation costs from {location} to each suggested destination
    - Factor in typical accommodation costs for {people} people
    - Account for food, local transportation, and activity costs

    TAILOR THE SUGGESTIONS TO:
    - Group type: {group_type} (suggest destinations with appropriate activities)
    - Travel period: {days} days (recommend destinations with enough attractions to fill this timeframe)
    - Starting point: {location} (consider travel time and costs from this location)
    - Number of travelers: {people} (suggest accommodations and activities suitable for this group size)

    Return ONLY a valid JSON object with this exact structure and field names:

    {{
      "suggested_destinations": [
        {{
          "destination": "",
          "reason": "",
          "estimated_total_cost": 0,
          "cost_breakdown": {{
            "flights_or_transportation": 0,
            "accommodation": 0,
            "food": 0,
            "activities": 0,
            "other": 0
          }}
        }}
      ],
      "itinerary_for_top_choice": [
        {{"day": 1, "activities": [""], "notes": ""}}
      ],
      "local_customs": [""],
      "packing_tips": [""],
      "budget_considerations": [""]
    }}

    IMPORTANT: Only include destinations where the total estimated cost is at or below the user's budget of ${budget}. Be realistic about costs based on current prices.
    Do not include any explanation, markdown formatting, or code blocks. Return only the valid JSON object.
    """
    result = ai_huggingface(prompt_suggest_template)
    return result

@app.post("/api/plans", status_code=status.HTTP_200_OK)
async def plan_holiday(
    destination: Annotated[str, Body()],
    budget: Annotated[float, Body()],
    people: Annotated[int, Body()],
    days: Annotated[int, Body()],
    group_type: Annotated[GroupType, Body()],
    current_user = Depends(get_current_active_user)
):
    date = datetime.now().strftime("%Y-%m-%d")
    prompt_plan_template = f"""
    You are a travel assistant that specializes in creating realistic and budget-conscious travel plans. Generate a detailed {days}-day travel plan for {people} people ({group_type}) visiting {destination} with a STRICT total budget of {budget} dollars, starting on {date}.

    IMPORTANT BUDGET CONSTRAINTS:
    - The total cost MUST NOT exceed {budget} dollars for all {people} people
    - Allocate budget appropriately across accommodations, food, activities, and transportation
    - Choose accommodations, activities, and dining options that are realistic for the {budget} dollar budget
    - Consider local cost of living in {destination} when making recommendations

    TAILOR THE PLAN TO THE USER'S SPECIFIC NEEDS:
    - Group type: {group_type} (adjust activities to be appropriate for this group type)
    - Number of people: {people} (consider group discounts or family packages if applicable)
    - Length of stay: {days} days (pace the itinerary appropriately)
    - Budget: ${budget} (very important - all suggestions must be affordable within this budget)

    Return ONLY a valid JSON object with this exact structure and field names. Do NOT include any example values, explanations, or extra text.

    {{
      "itinerary": [
        {{"day": 1, "activities": [""], "notes": "", "approximate_cost": 0}},
        {{"day": 2, "activities": [""], "notes": "", "approximate_cost": 0}}
      ],
      "accommodation_suggestions": [
        {{"name": "", "price_per_night": 0, "total_cost": 0}}
      ],
      "local_customs": [""],
      "packing_tips": [""],
      "budget_breakdown": {{
        "accommodation": 0,
        "food": 0,
        "activities": 0,
        "transportation": 0,
        "other": 0,
        "total": 0
      }}
    }}

    IMPORTANT: The sum of all costs in the budget_breakdown MUST equal or be less than {budget}. Each suggested activity, hotel, and restaurant must be realistically priced for {destination}.
    Do not include any explanation, markdown formatting, or code blocks. Return only the valid JSON object.
    """
    result = ai_huggingface(prompt_plan_template)
    return result

@app.get("/api/trips")
async def get_user_trips(current_user = Depends(get_current_active_user)):
    trips = find_trips_by_user(current_user["id"])
    return [
        {
            "id": trip.get("id"),
            "trip_type": trip.get("trip_type"),
            "data": trip.get("data"),
            "created_at": trip.get("created_at"),
            "updated_at": trip.get("updated_at"),
        }
        for trip in trips
    ]

@app.get("/api/trips/{trip_id}")
async def get_trip(trip_id: str, current_user = Depends(get_current_active_user)):
    trip = find_trip(trip_id, current_user["id"])
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {
        "id": trip.get("id"),
        "trip_type": trip.get("trip_type"),
        "data": trip.get("data"),
        "created_at": trip.get("created_at"),
        "updated_at": trip.get("updated_at"),
    }

@app.delete("/api/trips/{trip_id}", status_code=status.HTTP_200_OK)
async def delete_trip_endpoint(trip_id: str, current_user = Depends(get_current_active_user)):
    deleted_count = delete_trip(trip_id, current_user["id"])
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"detail": "Trip deleted successfully"}

@app.post("/api/trips/save", status_code=status.HTTP_200_OK)
async def save_trip(
    trip_type: Annotated[str, Body()],
    data: Annotated[dict, Body()],
    current_user = Depends(get_current_active_user)
):
    try:
        now = datetime.utcnow()
        new_trip = {
            "user_id": current_user["id"],
            "trip_type": trip_type,
            "data": data,
            "created_at": now,
            "updated_at": now
        }
        trip_id = insert_trip(new_trip)
        new_trip["_id"] = trip_id
        return {"message": "Trip saved successfully", "trip_id": str(trip_id)}
    except Exception as e:
        logger.error(f"Error saving trip: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save trip"
        )

async def create_trip(trip_data: TripCreate, current_user) -> Trip:
    now = datetime.utcnow()
    new_trip = {
        "user_id": current_user["id"],
        "trip_type": trip_data.trip_type,
        "location": trip_data.location,
        "destination": trip_data.destination,
        "budget": trip_data.budget,
        "people": trip_data.people,
        "days": trip_data.days,
        "group_type": trip_data.group_type,
        "data": trip_data.data,
        "created_at": now,
        "updated_at": now
    }
    trip_id = insert_trip(new_trip)
    new_trip["_id"] = trip_id
    return serialize_id(new_trip)

@app.get("/debug/ping")
async def debug_ping():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/debug/echo")
async def debug_echo(data: dict):
    return {"status": "ok", "received": data}
