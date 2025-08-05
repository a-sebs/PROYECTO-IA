from fastapi import APIRouter

router = APIRouter(tags=["Rutas Básicas"])

@router.get("/")
async def root():
    """
    Ruta principal - Hola Mundo
    """
    return {"message": "¡Hola Mundo desde FastAPI!"}


@router.get("/health")
async def health_check():
    """
    Verificación de salud de la API
    """
    return {
        "status": "OK",
        "version": "1.0.0",
        "timestamp": "2024-01-15T10:30:00Z"
    } 