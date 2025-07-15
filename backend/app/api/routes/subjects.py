from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
import uuid

from app.core.db import engine
from app.models import Subject, SubjectCreate, SubjectUpdate
from app.crud import create_subject, get_subject, get_subjects, update_subject, delete_subject

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/subjects/", response_model=Subject, tags=["subject"])
def create_subject_api(subject: SubjectCreate, session: Session = Depends(get_session)):
    return create_subject(session, subject)

@router.get("/subjects/", response_model=List[Subject], tags=["subject"])
def list_subjects(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return get_subjects(session, skip=skip, limit=limit)

@router.get("/subjects/{subject_id}", response_model=Subject, tags=["subject"])
def get_subject_api(subject_id: uuid.UUID, session: Session = Depends(get_session)):
    subject = get_subject(session, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.put("/subjects/{subject_id}", response_model=Subject, tags=["subject"])
def update_subject_api(subject_id: uuid.UUID, subject_in: SubjectUpdate, session: Session = Depends(get_session)):
    subject = update_subject(session, subject_id, subject_in)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.delete("/subjects/{subject_id}", response_model=bool, tags=["subject"])
def delete_subject_api(subject_id: uuid.UUID, session: Session = Depends(get_session)):
    return delete_subject(session, subject_id) 