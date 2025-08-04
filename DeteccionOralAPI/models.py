from pydantic import BaseModel
from typing import Optional

# Modelo para la detección de enfermedades orales
class DeteccionOral(BaseModel):
    imagen_base64: str
    confianza_minima: Optional[float] = 0.2
