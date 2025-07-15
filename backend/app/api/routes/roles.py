from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
import uuid

from app.core.db import engine
from app.models import Role, RoleCreate, RoleUpdate
from app.crud import create_role, get_role, get_roles, update_role, delete_role

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/roles/", response_model=Role, tags=["role"])
def create_role_api(role: RoleCreate, session: Session = Depends(get_session)):
    return create_role(session, role)

@router.get("/roles/", response_model=List[Role], tags=["role"])
def list_roles(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return get_roles(session, skip=skip, limit=limit)

@router.get("/roles/{role_id}", response_model=Role, tags=["role"])
def get_role_api(role_id: uuid.UUID, session: Session = Depends(get_session)):
    role = get_role(session, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.put("/roles/{role_id}", response_model=Role, tags=["role"])
def update_role_api(role_id: uuid.UUID, role_in: RoleUpdate, session: Session = Depends(get_session)):
    role = update_role(session, role_id, role_in)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.delete("/roles/{role_id}", response_model=bool, tags=["role"])
def delete_role_api(role_id: uuid.UUID, session: Session = Depends(get_session)):
    return delete_role(session, role_id) 