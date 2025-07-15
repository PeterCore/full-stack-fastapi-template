from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
import uuid

from app.core.db import engine
from app.models import Schedule, ScheduleCreate, ScheduleUpdate, ScheduleWithTeacher
from app.crud import create_schedule, get_schedule, get_schedules, update_schedule, delete_schedule

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/schedules/", response_model=Schedule, tags=["schedule"])
def create_schedule_api(schedule: ScheduleCreate, session: Session = Depends(get_session)):
    return create_schedule(session, schedule)

@router.get("/schedules/", response_model=List[ScheduleWithTeacher], tags=["schedule"])
def list_schedules(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return get_schedules(session, skip=skip, limit=limit)

@router.get("/schedules/{schedule_id}", response_model=Schedule, tags=["schedule"])
def get_schedule_api(schedule_id: uuid.UUID, session: Session = Depends(get_session)):
    schedule = get_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.put("/schedules/{schedule_id}", response_model=Schedule, tags=["schedule"])
def update_schedule_api(schedule_id: uuid.UUID, schedule_in: ScheduleUpdate, session: Session = Depends(get_session)):
    schedule = update_schedule(session, schedule_id, schedule_in)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.delete("/schedules/{schedule_id}", response_model=bool, tags=["schedule"])
def delete_schedule_api(schedule_id: uuid.UUID, session: Session = Depends(get_session)):
    return delete_schedule(session, schedule_id) 