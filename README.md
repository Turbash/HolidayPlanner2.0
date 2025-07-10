# Holiday Planner 2.0

A full-stack application for planning holidays and getting destination suggestions.

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (optional, the app will use in-memory storage if MongoDB is not available)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv .holidayenv
   source .holidayenv/bin/activate  # On Windows: .holidayenv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

5. Update the `.env` file with your API keys and configuration:
   ```
   HF_API_TOKEN=your_huggingface_token
   MODEL_ID=your_model_id
   WEATHERAPI_KEY=your_weatherapi_key
   FOURSQUARE_API_KEY=your_foursquare_key
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=holiday_planner
   SECRET_KEY=your_secret_key_here
   ```

6. Start the backend server (for production, remove `--reload` and use multiple workers):
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   VITE_BACKEND_URL=http://localhost:8000
   ```
   Set this to your deployed backend URL in production.

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at http://localhost:5173

## MongoDB Setup (Optional)

The application can run without MongoDB, using in-memory storage instead. However, data will be lost when the server restarts.

To set up MongoDB:

1. Install MongoDB Community Edition:
   - [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)

2. Start MongoDB:
   - On Linux/macOS: `sudo systemctl start mongod`
   - On Windows: Start MongoDB as a service

3. Update your `.env` file with the MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=holiday_planner
   ```

4. Restart the backend server.

## Features

- User authentication (JWT)
- Holiday planning with budget and itinerary
- Destination suggestions based on preferences
- Weather forecasts for destinations
- Save and manage trip plans
- Dashboard for users
- Responsive UI with Tailwind CSS

## Deployment Notes

- For production, use a production ASGI server (e.g., `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`)
- Set all environment variables in your deployment environment (do not commit secrets)
- Restrict CORS origins in `main.py` to your frontend domain(s)
- Serve the frontend `dist/` folder with a static host (Vercel, Netlify, etc.)
- Ensure `VITE_BACKEND_URL` in the frontend `.env` points to your deployed backend

## License

MIT
