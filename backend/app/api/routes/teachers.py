from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
import uuid

from app.core.db import engine
from app.models import Teacher, TeacherCreate, TeacherUpdate, TeacherWithSubject
from app.crud import create_teacher, get_teacher, get_teachers, update_teacher, delete_teacher

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/teachers/", response_model=Teacher, tags=["teacher"])
def create_teacher_api(teacher: TeacherCreate, session: Session = Depends(get_session)):
    return create_teacher(session, teacher)

@router.get("/teachers/", response_model=List[TeacherWithSubject], tags=["teacher"])
def list_teachers(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return get_teachers(session, skip=skip, limit=limit)

@router.get("/teachers/{teacher_id}", response_model=Teacher, tags=["teacher"])
def get_teacher_api(teacher_id: uuid.UUID, session: Session = Depends(get_session)):
    teacher = get_teacher(session, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.put("/teachers/{teacher_id}", response_model=Teacher, tags=["teacher"])
def update_teacher_api(teacher_id: uuid.UUID, teacher_in: TeacherUpdate, session: Session = Depends(get_session)):
    teacher = update_teacher(session, teacher_id, teacher_in)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.delete("/teachers/{teacher_id}", response_model=bool, tags=["teacher"])
def delete_teacher_api(teacher_id: uuid.UUID, session: Session = Depends(get_session)):
    return delete_teacher(session, teacher_id) 