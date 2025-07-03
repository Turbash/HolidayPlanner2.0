from fastapi import FastAPI, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, List, Dict, Any
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import os
import json
from enum import Enum
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import requests
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

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_ID = os.getenv("MODEL_ID")
app = FastAPI()

# Update CORS middleware configuration to be more permissive
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=False,  # Set to False for wildcard origins
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
    response =client.chat.completions.create(
        messages)
        
    return response.choices[0].message.content

# Public routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Holiday Planner API"}

@app.get("/weather/{city}")
async def get_weather(city: str, days: int = 5):
    """Get weather data for a city"""
    try:
        api_key = os.getenv("OPENWEATHERMAP_API_KEY")
        if not api_key:
            # Generate sample weather data for the requested number of days
            weather_data = {"list": []}
            
            # Weather conditions to cycle through
            conditions = [
                {"description": "clear sky", "icon": "01d"},
                {"description": "few clouds", "icon": "02d"},
                {"description": "scattered clouds", "icon": "03d"},
                {"description": "broken clouds", "icon": "04d"},
                {"description": "shower rain", "icon": "09d"},
                {"description": "rain", "icon": "10d"},
                {"description": "thunderstorm", "icon": "11d"},
                {"description": "snow", "icon": "13d"},
                {"description": "mist", "icon": "50d"}
            ]
            
            base_temp = random.randint(15, 25)  # Base temperature between 15-25°C
            
            for day in range(days):
                # Create a date for each day
                date = datetime.now() + timedelta(days=day)
                
                # Randomize temperature a bit each day
                daily_temp = base_temp + random.randint(-3, 3)
                
                # Pick a weather condition
                condition = random.choice(conditions)
                
                weather_data["list"].append({
                    "dt": int(date.timestamp()),
                    "main": {
                        "temp": daily_temp,
                        "temp_min": daily_temp - random.randint(1, 3),
                        "temp_max": daily_temp + random.randint(1, 3),
                        "humidity": random.randint(60, 90)
                    },
                    "weather": [
                        {
                            "description": condition["description"],
                            "icon": condition["icon"]
                        }
                    ]
                })
            
            return weather_data
        
        # Try to use the 16-day forecast API (requires paid subscription)
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast/daily",
            params={
                "q": city,
                "units": "metric",
                "cnt": days,  # Get data for the specified number of days
                "appid": api_key
            }
        )
        
        # If the API call fails (e.g., free tier doesn't have daily forecast), use the 5-day forecast
        if response.status_code != 200:
            response = requests.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "q": city,
                    "units": "metric",
                    "appid": api_key
                }
            )
            
            # Process the 3-hour forecast data to create a daily forecast
            if response.status_code == 200:
                data = response.json()
                
                # Get unique days from the forecast
                daily_forecasts = {}
                for item in data["list"]:
                    # Convert timestamp to date string
                    date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
                    # Only take the first forecast of each day (usually morning)
                    daily_forecasts[date] = item
                
                # Transform to daily data
                daily_data = {
                    "list": list(daily_forecasts.values())
                }
                
                return daily_data
    except Exception as e:
        return {"error": str(e)}

# Authentication routes
@app.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    try:
        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password length
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Check if user already exists
        existing_user = find_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user    
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
        
        # Return user without password
        user = document_to_dict(new_user)  # Changed from serialize_id to document_to_dict
        del user["hashed_password"]
        return user
    except HTTPException:
        # Re-raise HTTP exceptions as they already have status code and detail
        raise
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
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

# Trip planning routes - protected with authentication
@app.post("/api/suggestions", status_code=status.HTTP_200_OK)
async def suggest_destinations(
    location: Annotated[str, Body()],
    budget: Annotated[float, Body()],
    people: Annotated[int, Body()],
    days: Annotated[int, Body()],
    group_type: Annotated[GroupType, Body()],
    current_user = Depends(get_current_active_user)
):
    """Get travel suggestions based on criteria"""
    date = datetime.now().strftime("%Y-%m-%d")
    
    # Create suggestion prompt
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

    # Get AI response
    result = ai_huggingface(prompt_suggest_template)
    
    # Return the raw result for frontend consumption
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
    """Create a holiday plan for a destination"""
    date = datetime.now().strftime("%Y-%m-%d")
    
    # Create plan prompt
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

    # Get AI response
    result = ai_huggingface(prompt_plan_template)
    
    # Return the raw AI response for frontend consumption
    return result

# Trip management routes
@app.get("/api/trips", response_model=List[Trip])
async def get_user_trips(current_user = Depends(get_current_active_user)):
    """Get all trips for the current user"""
    trips = find_trips_by_user(current_user["id"])
    return trips  # Already serialized by find_trips_by_user

@app.get("/api/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str, current_user = Depends(get_current_active_user)):
    """Get a specific trip by ID"""
    trip = find_trip(trip_id, current_user["id"])
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip  # Already serialized by find_trip

@app.delete("/api/trips/{trip_id}", status_code=status.HTTP_200_OK)
async def delete_trip_endpoint(trip_id: str, current_user = Depends(get_current_active_user)):
    """Delete a trip by ID"""
    deleted_count = delete_trip(trip_id, current_user["id"])
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"detail": "Trip deleted successfully"}

# Internal helper function - not exposed as an endpoint
async def create_trip(trip_data: TripCreate, current_user) -> Trip:
    """Helper function to create a trip in the database"""
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

# Add simple debug endpoints
@app.get("/debug/ping")
async def debug_ping():
    """Simple endpoint to check if the API is accessible"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/debug/echo")
async def debug_echo(data: dict):
    """Echo back the received data for testing"""
    return {"status": "ok", "received": data}

@app.options("/api/{rest_of_path:path}")
async def options_route(rest_of_path: str):
    """Handle OPTIONS requests explicitly"""
    return {"detail": "OK"}
    return {"plan": result_data if 'result_data' in locals() else result}

# Trip management routes
@app.get("/api/trips", response_model=List[Trip])
async def get_user_trips(current_user = Depends(get_current_active_user)):
    """Get all trips for the current user"""
    trips = find_trips_by_user(current_user["id"])
    return trips  # Already serialized by find_trips_by_user

@app.get("/api/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str, current_user = Depends(get_current_active_user)):
    """Get a specific trip by ID"""
    trip = find_trip(trip_id, current_user["id"])
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip  # Already serialized by find_trip

@app.delete("/api/trips/{trip_id}", status_code=status.HTTP_200_OK)
async def delete_trip_endpoint(trip_id: str, current_user = Depends(get_current_active_user)):
    """Delete a trip by ID"""
    deleted_count = delete_trip(trip_id, current_user["id"])
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"detail": "Trip deleted successfully"}

# Internal helper function - not exposed as an endpoint
async def create_trip(trip_data: TripCreate, current_user) -> Trip:
    """Helper function to create a trip in the database"""
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

# Add simple debug endpoints
@app.get("/debug/ping")
async def debug_ping():
    """Simple endpoint to check if the API is accessible"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/debug/echo")
async def debug_echo(data: dict):
    """Echo back the received data for testing"""
    return {"status": "ok", "received": data}

@app.options("/api/{rest_of_path:path}")
async def options_route(rest_of_path: str):
    """Handle OPTIONS requests explicitly"""
    return {"detail": "OK"}
