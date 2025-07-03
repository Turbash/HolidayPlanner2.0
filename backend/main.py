from fastapi import FastAPI, Body
from typing import Annotated
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import os
from enum import Enum
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware  # Add this import

load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_ID = os.getenv("MODEL_ID")
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
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

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Holiday Planner API"}

@app.post("/suggest-destinations")
async def suggest_destinations(location: Annotated[str, Body()], budget: Annotated[float, Body()], people: Annotated[int, Body()], days: Annotated[int, Body()],group_type: Annotated[GroupType, Body()]):
    date=datetime.now().strftime("%Y-%m-%d")
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
    
    # Clean up the response to extract just the JSON if needed
    if "```json" in result:
        result = result.split("```json")[1].split("```")[0].strip()
    elif "```" in result:
        result = result.split("```")[1].split("```")[0].strip()
        
    return result

@app.post("/plan-holiday")
async def plan_holiday(destination: Annotated[str, Body()], budget: Annotated[float, Body()], people: Annotated[int, Body()], days: Annotated[int, Body()], group_type: Annotated[GroupType, Body()]):
    date=datetime.now().strftime("%Y-%m-%d")
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
    
    # Clean up the response to extract just the JSON if needed
    if "```json" in result:
        result = result.split("```json")[1].split("```")[0].strip()
    elif "```" in result:
        result = result.split("```")[1].split("```")[0].strip()
        
    return result