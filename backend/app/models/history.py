from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, JSON, DateTime
from app.database.database import Base

class DesignHistory(Base):
    __tablename__ = "design_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prompt = Column(String, nullable=False)
    response = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "prompt": self.prompt,
            "response": self.response,
            "created_at": self.created_at.isoformat()
        }
