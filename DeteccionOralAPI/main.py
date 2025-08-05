from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import post_routes, auth_routes
from database import DatabaseManager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pytz
import os

# Verificar que el modelo YOLO existe
if not os.path.exists("best.pt"):
    print("ADVERTENCIA: No se encontró el archivo 'best.pt'.")

# Inicializar scheduler para tareas automáticas
scheduler = AsyncIOScheduler()

def tarea_recarga_creditos():
    """Tarea que se ejecuta a las 00:10 Colombia para recargar créditos"""
    try:
        print("🔄 Ejecutando recarga automática de créditos...")
        db = DatabaseManager()
        usuarios_recargados = db.recargar_creditos_diarios()
        print(f"✅ Recarga automática completada: {usuarios_recargados} usuarios recargados")
        return usuarios_recargados
    except Exception as e:
        print(f"❌ Error en recarga automática: {e}")
        return 0

# Crear aplicación FastAPI
app = FastAPI(
    title="API Detección Oral",
    description="API para detectar enfermedades orales con YOLO",
    version="1.0.0"
)

colombia_tz = pytz.timezone('America/Bogota')

# Agregar tarea programada para las 00:10 Colombia cada domingo (cada 7 días)
scheduler.add_job(
    tarea_recarga_creditos,
    'cron',
    day_of_week=6,  # 0=lunes, 6=domingo
    hour=0,
    minute=10,
    timezone=colombia_tz,
    id='recarga_creditos_semanal',
    name='Recarga Créditos Semanal'
)

@app.on_event("startup")
async def startup_event():
    """Inicializar scheduler y verificar recarga al iniciar"""
    print("🚀 Iniciando API de Detección Oral...")
    
    # Iniciar scheduler
    scheduler.start()
    print("🕛 Scheduler iniciado - Recarga programada para las 00:10 Colombia cada domingo")
    
    # Verificar recarga de créditos al iniciar
    print("🔄 Verificando recarga de créditos al iniciar...")
    db = DatabaseManager()
    usuarios_recargados = db.recargar_creditos_diarios()
    print(f"✅ Verificación inicial completada: {usuarios_recargados} usuarios recargados")

@app.on_event("shutdown")
async def shutdown_event():
    """Detener scheduler al cerrar la aplicación"""
    print("🛑 Deteniendo scheduler...")
    scheduler.shutdown()
    print("✅ Scheduler detenido correctamente")

# CORS para React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://172.29.28.105:3000",
        "https://nc26qlpz-3000.use2.devtunnels.ms",
        "https://nc26qlpz-3000.use2.devtunnels.ms/",
        "https://nc26qlpz-8001.use2.devtunnels.ms",
        "https://nc26qlpz-8001.use2.devtunnels.ms/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(post_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
async def root():
    return {
        "app": "API Detección Oral",
        "version": "1.0.0",
        "endpoints": {
            "detectar": "POST /api/detectar-con-datos",
            "info": "GET /api/info"
        }
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "modelo_disponible": os.path.exists("best.pt")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
