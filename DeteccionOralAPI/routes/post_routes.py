from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models import DeteccionOral
from services.modelo_yolo import ModeloYOLO
from database import get_db_manager
import io
import base64
import json

router = APIRouter(tags=["Detección Oral"])

modelo_yolo = ModeloYOLO()


@router.post("/api/detectar-con-datos")
async def detectar_con_datos(entrada: DeteccionOral):
    """
    Detecta enfermedades orales y retorna imagen + datos de detección
    """
    try:
        # Validar entrada
        if not entrada.imagen_base64.strip():
            raise HTTPException(status_code=400, detail="La imagen no puede estar vacía")
        
        if entrada.confianza_minima < 0 or entrada.confianza_minima > 1:
            raise HTTPException(status_code=400, detail="La confianza mínima debe estar entre 0 y 1")
        
        # Realizar detección y obtener datos
        datos_deteccion = modelo_yolo.detectar_enfermedades(
            imagen_base64=entrada.imagen_base64,
            confianza_minima=entrada.confianza_minima
        )
        
        # Obtener imagen con bboxes
        imagen_con_bboxes = modelo_yolo.detectar_con_visualizacion(
            imagen_base64=entrada.imagen_base64,
            confianza_minima=entrada.confianza_minima
        )
        
        # Convertir imagen a base64
        imagen_resultado_base64 = base64.b64encode(imagen_con_bboxes).decode('utf-8')
        
        # Retornar datos + imagen
        return {
            "imagen_resultado": f"data:image/jpeg;base64,{imagen_resultado_base64}",
            "detecciones": datos_deteccion["detecciones"],
            "total_detecciones": datos_deteccion["total_detecciones"],
            "tiempo_procesamiento": datos_deteccion["tiempo_procesamiento"],
            "modelo_usado": datos_deteccion["modelo_usado"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

@router.get("/api/info")
async def obtener_info_modelo():
    """
    Obtiene información sobre el modelo
    """
    try:
        info = modelo_yolo.get_model_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/api/info-descargas/{user_id}")
async def obtener_info_descargas(user_id: int):
    """
    Obtiene información de descargas del usuario
    """
    try:
        info = get_db_manager().obtener_info_descargas(user_id)
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/api/usar-descarga/{user_id}")
async def usar_descarga(user_id: int):
    """
    Usar una descarga gratuita del usuario
    """
    try:
        db = get_db_manager()
        info = db.obtener_info_descargas(user_id)

        if info["puede_descargar"]:
            if not info["plan_activo"]:  # Solo decrementar si no tiene plan activo
                success = db.decrementar_descarga_gratuita(user_id)
                if not success:
                    raise HTTPException(status_code=400, detail="No se pudo usar la descarga")
            
            return {"success": True, "mensaje": "Descarga autorizada"}
        else:
            raise HTTPException(status_code=403, detail="Sin descargas disponibles")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/api/crear-suscripcion")
async def crear_suscripcion(data: dict):
    """
    Crear una nueva suscripción
    """
    try:
        user_id = data.get("user_id")
        plan_tipo = data.get("plan_tipo")
        
        if not user_id or not plan_tipo:
            raise HTTPException(status_code=400, detail="user_id y plan_tipo son requeridos")
        
        # Definir duración según el plan
        duraciones = {
            "premium": 7,      # 7 días
            "vip": 30,         # 30 días  
            "vip_advanced": 365 # 1 año
        }
        
        precios = {
            "premium": 4.99,
            "vip": 14.99,
            "vip_advanced": 149.99
        }
        
        if plan_tipo not in duraciones:
            raise HTTPException(status_code=400, detail="Tipo de plan inválido")
        
        success = get_db_manager().crear_suscripcion(
            user_id,
            plan_tipo,
            duraciones[plan_tipo],
            precios[plan_tipo]
        )
        
        if success:
            return {"success": True, "mensaje": f"Suscripción {plan_tipo} creada exitosamente"}
        else:
            raise HTTPException(status_code=500, detail="Error creando suscripción")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/api/cancelar-suscripcion/{user_id}")
async def cancelar_suscripcion(user_id: int):
    """Cancelar la suscripción activa del usuario y volver al plan gratuito"""
    try:
        # Verificar si el usuario tiene una suscripción activa
        db = get_db_manager()
        plan_activo = db.verificar_suscripcion_activa(user_id)

        if not plan_activo:
            raise HTTPException(status_code=400, detail="El usuario no tiene una suscripción activa")

        # Cancelar la suscripción
        success = db.cancelar_suscripcion(user_id)

        if success:
            # Dar créditos iniciales al volver al plan gratuito (1000 créditos)
            db.agregar_creditos(user_id, 1000)
            
            return {
                "success": True, 
                "mensaje": "Suscripción cancelada exitosamente. Has vuelto al plan gratuito con 1000 créditos.",
                "creditos_agregados": 1000
            }
        else:
            raise HTTPException(status_code=500, detail="Error al cancelar la suscripción")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/api/resetear-descargas/{user_id}")
async def resetear_descargas_usuario(user_id: int):
    """
    Resetear las descargas gratuitas de un usuario específico a 2
    """
    try:
        success = get_db_manager().resetear_descargas_gratuitas(user_id)
        
        if success:
            return {
                "success": True, 
                "mensaje": f"Descargas gratuitas reseteadas a 2 para el usuario {user_id}"
            }
        else:
            raise HTTPException(status_code=500, detail="Error al resetear las descargas")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/api/resetear-todas-descargas")
async def resetear_todas_las_descargas():
    """
    Resetear las descargas gratuitas de todos los usuarios sin plan activo a 2
    """
    try:
        success = get_db_manager().resetear_descargas_gratuitas()
        
        if success:
            return {
                "success": True, 
                "mensaje": "Descargas gratuitas reseteadas a 2 para todos los usuarios sin plan activo"
            }
        else:
            raise HTTPException(status_code=500, detail="Error al resetear las descargas")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
