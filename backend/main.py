from fastapi import FastAPI,Body
from typing import Annotated
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import os

load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_ID = os.getenv("MODEL_ID")
app = FastAPI()

client = InferenceClient(model=MODEL_ID, token=HF_API_TOKEN)
def ai_huggingface(prompt):
    messages = [{"role": "user", "content": prompt}]
    response =client.chat.completions.create(
        messages)
        
    return response.choices[0].message.content

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Holiday Planner API"}

@app.post("/plan-holiday")
async def plan_holiday(destination: Annotated[str, Body()], budget: Annotated[int, Body()], people: Annotated[int, Body()], days: Annotated[int, Body()]):
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

    result = ai_huggingface(prompt_plan_template)
    return result

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

    result = ai_huggingface(prompt_suggest_template)   
    return result