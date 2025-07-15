#!/usr/bin/env python3
import os
import sys

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, create_engine
from app.core.config import settings

# 创建数据库引擎
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

def fix_teacher_table():
    """修复 teacher 表结构，移除 role_id 字段"""
    with engine.connect() as conn:
        # 检查 role_id 字段是否存在
        result = conn.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'teacher' AND column_name = 'role_id'
        """).fetchone()
        
        if result:
            print("发现 role_id 字段，正在移除...")
            # 移除 role_id 字段
            conn.execute("ALTER TABLE teacher DROP COLUMN IF EXISTS role_id")
            print("role_id 字段已移除")
        else:
            print("teacher 表中没有 role_id 字段")
        
        # 检查并确保 subject_id 字段不为空
        conn.execute("ALTER TABLE teacher ALTER COLUMN subject_id SET NOT NULL")
        print("subject_id 字段已设置为 NOT NULL")
        
        conn.commit()
        print("teacher 表结构修复完成")

if __name__ == "__main__":
    fix_teacher_table() 