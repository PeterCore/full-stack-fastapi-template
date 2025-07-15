#!/bin/bash

echo "Stopping backend service..."
pkill -f uvicorn
echo "Backend service stopped." 