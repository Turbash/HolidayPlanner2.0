from fastapi import FastAPI,Body
from transformers import pipeline
from typing import Annotated

pipe = pipeline("text-generation", model="google/flan-t5-base")

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Holiday Planner API"}

@app.post("/plan-holiday")
async def plan_holiday(destination: Annotated[str, Body()], budget: Annotated[int, Body()], people: Annotated[int, Body()], days: Annotated[int, Body()]):
    #dummy plan skeleton
    prompt_plan_template = f"""
    You are a travel assistant. Generate a detailed {days}-day travel plan for {people} people visiting {destination} with a total budget of {budget} INR.

    Return ONLY a valid JSON object with this exact structure and field names. Do NOT include any example values, explanations, or extra text. Fill all fields with realistic, context-appropriate information for the trip.

    {{
      "itinerary": [
        {{"day": 1, "activities": [""], "notes": ""}},
        {{"day": 2, "activities": [""], "notes": ""}}
      ],
      "local_customs": [""],
      "restaurants": [
        {{"name": "", "cuisine": "", "booking_link": "", "estimated_price": 0}}
      ],
      "hotels": [
        {{"name": "", "booking_link": "", "estimated_price": 0}}
      ],
      "packing_tips": [""],
      "weather": {{"temperature": "", "condition": ""}},
      "emergency_numbers": {{"police": "", "ambulance": "", "fire": ""}}
    }}

    IMPORTANT: Do not include any text, comments, or example values outside the JSON object. Only return the filled JSON object.
    """

    return {
        "itinerary":[{
            "day": 1,
        },{
            "day": 2,
        }],
        "local_customs": "some local customs",
        "restaurants": ["Restaurant A", "Restaurant B"],
        "hotels": ["Hotel A", "Hotel B"],
        "weather":{
            "temperature": "30°C",
            "condition": "Sunny"
        },
        "emrgency_numbers": {"police": "100", "ambulance": "102", "fire": "101"},
    }

@app.post("/suggest-destinations")
async def suggest_destinations(location: Annotated[str, Body()], budget: Annotated[int, Body()], people: Annotated[int, Body()], days: Annotated[int, Body()]):
    
    prompt_suggest_template = f"""
    You are a travel assistant. Based on the user's location ({location}), budget ({budget} INR), number of people ({people}), and number of days ({days}), suggest the best travel destination(s) and generate a detailed travel plan.
    
    Return ONLY a valid JSON object with this exact structure and field names. Do NOT include any example values, explanations, or extra text. Fill all fields with realistic, context-appropriate information for the trip.
    
    {{
      "suggested_destinations": [
        {{"destination": "", "reason": ""}}
      ],
      "itinerary": [
        {{"day": 1, "activities": [""], "notes": ""}}
      ],
      "local_customs": [""],
      "restaurants": [
        {{"name": "", "cuisine": "", "booking_link": "", "estimated_price": 0}}
      ],
      "hotels": [
        {{"name": "", "booking_link": "", "estimated_price": 0}}
      ],
      "packing_tips": [""],
      "weather": {{"temperature": "", "condition": ""}},
      "emergency_numbers": {{"police": "", "ambulance": "", "fire": ""}}
    }}
    
    IMPORTANT: Do not include any text, comments, or example values outside the JSON object. Only return the filled JSON object.
    """
    return {
        #dummy plan skeleton

        "itinerary":[{
            "day": 1,
        },{
            "day": 2,
        }],
        "local_customs": "some local customs",
        "restaurants": ["Restaurant A", "Restaurant B"],
        "hotels": ["Hotel A", "Hotel B"],
        "weather":{
            "temperature": "30°C",
            "condition": "Sunny"
        },
        "emrgency_numbers": {"police": "100", "ambulance": "102", "fire": "101"},
    }