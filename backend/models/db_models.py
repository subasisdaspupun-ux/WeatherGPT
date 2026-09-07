from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
try:
    from database import Base
except ModuleNotFoundError:
    from backend.database import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    risk_level = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AlertLog(Base):
    __tablename__ = "alert_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    severity = Column(String)
    message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
