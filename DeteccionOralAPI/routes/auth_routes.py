from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from database import get_db_manager
from typing import Optional
import re

router = APIRouter()

class UsuarioRegistro(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    confirm_password: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsarCreditosRequest(BaseModel):
    user_id: int

def validar_password(password: str) -> bool:
    """Validar que la contraseña tenga al menos 6 caracteres"""
    return len(password) >= 6

def validar_nombre(nombre: str) -> bool:
    """Validar que el nombre solo contenga letras y espacios"""
    return re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', nombre) is not None

@router.post("/api/registro")
async def registrar_usuario(usuario: UsuarioRegistro):
    """Registrar un nuevo usuario"""
    try:
        # Validaciones
        if not validar_nombre(usuario.nombre):
            raise HTTPException(status_code=400, detail="El nombre solo puede contener letras")
        
        if not validar_nombre(usuario.apellido):
            raise HTTPException(status_code=400, detail="El apellido solo puede contener letras")
        
        if not validar_password(usuario.password):
            raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
        
        if usuario.password != usuario.confirm_password:
            raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")
        
        # Crear usuario
        resultado = get_db_manager().crear_usuario(
            usuario.nombre.strip(),
            usuario.apellido.strip(),
            usuario.email.lower(),
            usuario.password
        )
        
        if resultado["success"]:
            return {
                "success": True,
                "message": "Usuario registrado exitosamente",
                "user_id": resultado["user_id"]
            }
        else:
            raise HTTPException(status_code=400, detail=resultado["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/api/login")
async def login_usuario(usuario: UsuarioLogin):
    """Iniciar sesión"""
    try:
        resultado = get_db_manager().validar_usuario(usuario.email.lower(), usuario.password)
        
        if resultado["success"]:
            return {
                "success": True,
                "message": "Inicio de sesión exitoso",
                "user": resultado["user"]
            }
        else:
            raise HTTPException(status_code=401, detail=resultado["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/api/usuario/{user_id}")
async def obtener_usuario(user_id: int):
    """Obtener información del usuario"""
    try:
        usuario = get_db_manager().obtener_usuario(user_id)
        
        if usuario:
            return {
                "success": True,
                "user": usuario
            }
        else:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/api/usar-creditos")
async def usar_creditos(request: UsarCreditosRequest):
    """Usar créditos del usuario para análisis de IA"""
    try:
        resultado = get_db_manager().usar_creditos(request.user_id, 150)
        
        if resultado["success"]:
            return {
                "success": True,
                "message": f"Se usaron {resultado['creditos_usados']} créditos",
                "creditos_restantes": resultado["creditos_restantes"]
            }
        else:
            raise HTTPException(status_code=400, detail=resultado["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/auth/plan-activo/{user_id}")
async def obtener_plan_activo(user_id: int):
    """Obtener el plan activo del usuario"""
    try:
        plan_activo = get_db_manager().verificar_suscripcion_activa(user_id)
        return {
            "user_id": user_id,
            "plan_activo": plan_activo
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/api/recargar-creditos")
async def recargar_creditos():
    """Recargar créditos diarios (endpoint para administración)"""
    try:
        usuarios_recargados = get_db_manager().recargar_creditos_diarios()
        return {
            "success": True,
            "message": f"Se recargaron créditos para {usuarios_recargados} usuarios"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")
