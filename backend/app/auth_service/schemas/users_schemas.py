from pydantic import BaseModel, Field, field_validator, EmailStr
import re

class UserCreate(BaseModel):
    
    username: str = Field(
        min_length=4,
        max_length=30
    ) 

    password: str = Field(
        min_length=8,
        max_length=100
    )

    email: EmailStr

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not re.search(f"[A-Z]", value):
            raise ValueError(
                "Password must contain an uppercase letter"
            )
        
        if not re.search(r"[0-9]", value):
            raise ValueError(
                "Password must contain a number"
            )
        
        return value


class UserResponse(BaseModel):
    id: str

    username: str

    email: EmailStr
    

    class Config:
        from_attributes = True