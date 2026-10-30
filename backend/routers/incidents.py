from fastapi import APIRouter, Body, HTTPException
from typing import Any
from datetime import datetime, timezone
from pymongo.errors import PyMongoError

from database import incidents_collection

router = APIRouter(prefix="/incidents", tags=["Incidents"])


def serialize_incident(incident: dict) -> dict:
    incident["_id"] = str(incident["_id"])
    return incident


@router.get("/")
def get_incidents():
    try:
        incidents = list(
            incidents_collection.find().sort("created_at", -1)
        )

        return {
            "status": "success",
            "incidents": [
                serialize_incident(item) for item in incidents
            ],
        }

    except PyMongoError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve incidents: {str(error)}",
        )


@router.post("/")
def create_incident(incident: dict[str, Any] = Body(...)):
    try:
        incident["created_at"] = datetime.now(timezone.utc)

        result = incidents_collection.insert_one(incident)

        saved_incident = incidents_collection.find_one(
            {"_id": result.inserted_id}
        )

        return {
            "status": "success",
            "message": "Incident saved successfully",
            "incident": serialize_incident(saved_incident),
        }

    except PyMongoError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save incident: {str(error)}",
        )