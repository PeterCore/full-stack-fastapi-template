from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, teachers, roles, subjects, students, schedules, courses
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(teachers.router)
api_router.include_router(roles.router)
api_router.include_router(subjects.router)
api_router.include_router(students.router)
api_router.include_router(schedules.router)
api_router.include_router(courses.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
