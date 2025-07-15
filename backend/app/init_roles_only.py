import uuid
import logging
from sqlmodel import Session, select

from app.core.db import engine
from app.models import Role

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_roles():
    """初始化角色数据"""
    try:
        with Session(engine) as session:
            # 检查是否已有角色数据
            existing_roles = session.exec(select(Role)).all()
            if existing_roles:
                logger.info("角色数据已存在，跳过初始化")
                return

            # 创建默认角色
            default_roles = [
                Role(
                    id=uuid.uuid4(),
                    name="语文",
                    description="语文教师"
                ),
                Role(
                    id=uuid.uuid4(),
                    name="数学", 
                    description="数学教师"
                ),
                Role(
                    id=uuid.uuid4(),
                    name="英语",
                    description="英语教师"
                )
            ]

            for role in default_roles:
                session.add(role)

            session.commit()
            logger.info("角色数据初始化完成")
    except Exception as e:
        logger.error(f"初始化角色数据失败: {e}")
        raise


if __name__ == "__main__":
    init_roles() 