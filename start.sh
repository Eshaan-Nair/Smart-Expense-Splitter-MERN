#!/bin/bash

# Move into backend and install dependencies
cd backend
npm install

# Start backend in background
npm start &

# Move into frontend and install dependencies
cd ../frontend
npm install

# Build frontend if needed (for React/Next.js)
npm run build

# Start frontend
npm start
