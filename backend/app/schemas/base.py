from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field

class BaseSchema(BaseModel):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
