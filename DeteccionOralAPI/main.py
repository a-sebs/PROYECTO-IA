from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import post_routes, auth_routes
from database import get_db_manager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pytz
import os

# Verificar que el modelo YOLO existe al arrancar
MODEL_PATH = os.getenv("MODEL_PATH", "best.pt")
if not os.path.exists(MODEL_PATH):
    print(f"⚠️  ADVERTENCIA: No se encontró el modelo '{MODEL_PATH}'. Se usará modo simulado.")

# Inicializar scheduler
scheduler = AsyncIOScheduler()
colombia_tz = pytz.timezone('America/Bogota')


def tarea_recarga_creditos():
    """Tarea que se ejecuta a las 00:10 Colombia cada domingo para recargar créditos."""
    try:
        print("🔄 Ejecutando recarga automática de créditos...")
        db = get_db_manager()
        usuarios_recargados = db.recargar_creditos_diarios()
        print(f"✅ Recarga automática completada: {usuarios_recargados} usuarios recargados")
        return usuarios_recargados
    except Exception as e:
        print(f"❌ Error en recarga automática: {e}")
        return 0


# Agregar tarea programada para las 00:10 Colombia cada domingo
scheduler.add_job(
    tarea_recarga_creditos,
    'cron',
    day_of_week=6,   # 0=lunes, 6=domingo
    hour=0,
    minute=10,
    timezone=colombia_tz,
    id='recarga_creditos_semanal',
    name='Recarga Créditos Semanal'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestor de ciclo de vida de la aplicación (reemplaza los deprecated on_event).
    El código antes del yield se ejecuta al iniciar; el de después, al cerrar.
    """
    # --- STARTUP ---
    print("🚀 Iniciando API de Detección Oral...")

    # Inicializar la base de datos (lazy init)
    try:
        db = get_db_manager()
        print("✅ Conexión a la base de datos establecida.")
        usuarios_recargados = db.recargar_creditos_diarios()
        print(f"✅ Verificación inicial de créditos: {usuarios_recargados} usuarios recargados")
    except Exception as e:
        print(f"❌ Error al conectar con la base de datos: {e}")

    # Iniciar scheduler
    scheduler.start()
    print("🕛 Scheduler iniciado — Recarga programada: domingos a las 00:10 (Colombia)")

    yield  # La API está corriendo

    # --- SHUTDOWN ---
    print("🛑 Deteniendo API...")
    scheduler.shutdown(wait=False)
    print("✅ Scheduler detenido correctamente.")


# Crear aplicación FastAPI
app = FastAPI(
    title="API Detección Oral",
    description="API para detectar enfermedades orales con YOLO + PostgreSQL",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://denditec.vercel.app"
).split(",")



app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(post_routes.router)
app.include_router(auth_routes.router)


@app.get("/", tags=["Inicio"])
async def root():
    return {
        "app": "API Detección Oral",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "detectar": "POST /api/detectar-con-datos",
            "info_modelo": "GET /api/info",
            "registro": "POST /api/registro",
            "login": "POST /api/login",
        }
    }


@app.get("/health", tags=["Inicio"])
async def health():
    """Endpoint de salud para Docker healthcheck."""
    modelo_ok = os.path.exists(MODEL_PATH)
    try:
        db = get_db_manager()
        # Verificar conexión activa
        with db.get_session() as session:
            session.execute(__import__('sqlalchemy').text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok" if (modelo_ok and db_ok) else "degraded",
        "modelo_disponible": modelo_ok,
        "database_ok": db_ok
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=False
    )
