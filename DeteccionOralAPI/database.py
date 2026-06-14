import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Numeric, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError

Base = declarative_base()

# --- DEFINICIÓN DE MODELOS ---
class Usuario(Base):
    __tablename__ = 'usuarios'
    IdUser = Column(Integer, primary_key=True, index=True)
    NombreUser = Column(String, nullable=False)
    ApellidoUser = Column(String, nullable=False)
    EmailUser = Column(String, unique=True, nullable=False)
    ClaveUser = Column(String, nullable=False)
    Creditos = Column(Integer, default=1050)
    UltimaRecarga = Column(DateTime, default=datetime.utcnow)
    FechaCreacion = Column(DateTime, default=datetime.utcnow)
    DescargasGratuitas = Column(Integer, default=2)

class Suscripcion(Base):
    __tablename__ = 'suscripciones'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('usuarios.IdUser'))
    plan_tipo = Column(String(20), nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=False)
    estado = Column(String(20), default='activa')
    precio = Column(Numeric(10, 2))


# --- GESTOR DE BASE DE DATOS ---
class DatabaseManager:
    _instance = None
    _engine = None
    _SessionLocal = None

    def __new__(cls):
        """Singleton para reutilizar la misma conexión en toda la app."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        # Lee la variable de entorno para PostgreSQL. Si no existe, usa SQLite local.
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./usuarios.db")

        # Corrección obligatoria para plataformas cloud (Heroku, Render, etc.)
        if self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql://", 1)

        # Configuración del motor según el tipo de base de datos
        if self.database_url.startswith("sqlite"):
            connect_args = {"check_same_thread": False}
            self._engine = create_engine(
                self.database_url,
                connect_args=connect_args,
                pool_pre_ping=True
            )
        else:
            # PostgreSQL: pool de conexiones optimizado para producción
            self._engine = create_engine(
                self.database_url,
                pool_size=5,
                max_overflow=10,
                pool_timeout=30,
                pool_pre_ping=True,  # Verifica conexiones antes de usarlas
                pool_recycle=1800    # Recicla conexiones cada 30 min
            )

        self._SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self._engine
        )
        self.init_database()

    def init_database(self):
        """Inicializar la base de datos y crear las tablas usando ORM."""
        try:
            Base.metadata.create_all(bind=self._engine)
            print("✅ Base de datos inicializada correctamente.")
        except OperationalError as e:
            print(f"❌ Error al conectar con la base de datos: {e}")
            raise

    def get_session(self):
        """Retorna una nueva sesión de base de datos."""
        return self._SessionLocal()

    def hash_password(self, password: str) -> str:
        """Hashear contraseña usando SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()

    def crear_usuario(self, nombre: str, apellido: str, email: str, password: str) -> Dict[str, Any]:
        with self.get_session() as db:
            try:
                if db.query(Usuario).filter(Usuario.EmailUser == email).first():
                    return {"success": False, "error": "El email ya está registrado"}

                nuevo_usuario = Usuario(
                    NombreUser=nombre,
                    ApellidoUser=apellido,
                    EmailUser=email,
                    ClaveUser=self.hash_password(password)
                )
                db.add(nuevo_usuario)
                db.commit()
                db.refresh(nuevo_usuario)

                return {
                    "success": True,
                    "user_id": nuevo_usuario.IdUser,
                    "message": "Usuario creado exitosamente"
                }
            except Exception as e:
                db.rollback()
                return {"success": False, "error": str(e)}

    def validar_usuario(self, email: str, password: str) -> Dict[str, Any]:
        with self.get_session() as db:
            try:
                password_hash = self.hash_password(password)
                user = db.query(Usuario).filter(
                    Usuario.EmailUser == email,
                    Usuario.ClaveUser == password_hash
                ).first()

                if user:
                    return {
                        "success": True,
                        "user": {
                            "id": user.IdUser,
                            "nombre": user.NombreUser,
                            "apellido": user.ApellidoUser,
                            "email": user.EmailUser,
                            "creditos": user.Creditos
                        }
                    }
                return {"success": False, "error": "Credenciales incorrectas"}
            except Exception as e:
                return {"success": False, "error": str(e)}

    def obtener_usuario(self, user_id: int) -> Optional[Dict[str, Any]]:
        with self.get_session() as db:
            try:
                user = db.query(Usuario).filter(Usuario.IdUser == user_id).first()
                if user:
                    return {
                        "id": user.IdUser,
                        "nombre": user.NombreUser,
                        "apellido": user.ApellidoUser,
                        "email": user.EmailUser,
                        "creditos": user.Creditos,
                        "ultima_recarga": user.UltimaRecarga,
                        "descargas_gratuitas": user.DescargasGratuitas
                    }
                return None
            except Exception as e:
                print(f"Error obteniendo usuario: {e}")
                return None

    def usar_creditos(self, user_id: int, cantidad: int = 150) -> Dict[str, Any]:
        with self.get_session() as db:
            try:
                user = db.query(Usuario).filter(Usuario.IdUser == user_id).first()
                if not user:
                    return {"success": False, "error": "Usuario no encontrado"}

                if user.Creditos < cantidad:
                    return {"success": False, "error": "Créditos insuficientes"}

                user.Creditos -= cantidad
                db.commit()

                return {
                    "success": True,
                    "creditos_restantes": user.Creditos,
                    "creditos_usados": cantidad
                }
            except Exception as e:
                db.rollback()
                return {"success": False, "error": str(e)}

    def recargar_creditos_diarios(self) -> int:
        with self.get_session() as db:
            try:
                limite_tiempo = datetime.utcnow() - timedelta(hours=2)
                usuarios = db.query(Usuario).filter(Usuario.UltimaRecarga < limite_tiempo).all()
                for user in usuarios:
                    user.Creditos = 1050
                    user.UltimaRecarga = datetime.utcnow()

                db.commit()
                return len(usuarios)
            except Exception as e:
                print(f"Error recargando créditos: {e}")
                db.rollback()
                return 0

    def crear_suscripcion(self, user_id: int, plan_tipo: str, dias_duracion: int, precio: float = 0.0) -> bool:
        with self.get_session() as db:
            try:
                fecha_exp = datetime.utcnow() + timedelta(days=dias_duracion)
                nueva_sub = Suscripcion(
                    user_id=user_id,
                    plan_tipo=plan_tipo,
                    fecha_expiracion=fecha_exp,
                    precio=precio
                )
                db.add(nueva_sub)
                db.commit()
                return True
            except Exception as e:
                print(f"Error creando suscripción: {e}")
                db.rollback()
                return False

    def verificar_suscripcion_activa(self, user_id: int) -> Optional[str]:
        with self.get_session() as db:
            try:
                sub = db.query(Suscripcion).filter(
                    Suscripcion.user_id == user_id,
                    Suscripcion.estado == 'activa',
                    Suscripcion.fecha_expiracion > datetime.utcnow()
                ).order_by(Suscripcion.fecha_expiracion.desc()).first()

                return sub.plan_tipo if sub else None
            except Exception as e:
                print(f"Error verificando suscripción: {e}")
                return None

    def decrementar_descarga_gratuita(self, user_id: int) -> bool:
        with self.get_session() as db:
            try:
                user = db.query(Usuario).filter(Usuario.IdUser == user_id).first()
                if user and user.DescargasGratuitas > 0:
                    user.DescargasGratuitas -= 1
                    db.commit()
                    return True
                return False
            except Exception as e:
                print(f"Error decrementando descarga: {e}")
                db.rollback()
                return False

    def obtener_info_descargas(self, user_id: int) -> Dict[str, Any]:
        with self.get_session() as db:
            try:
                user = db.query(Usuario).filter(Usuario.IdUser == user_id).first()
                plan_activo = self.verificar_suscripcion_activa(user_id)
                descargas = user.DescargasGratuitas if user else 0

                return {
                    "descargas_restantes": descargas,
                    "plan_activo": plan_activo,
                    "puede_descargar": bool(plan_activo or descargas > 0)
                }
            except Exception as e:
                print(f"Error obteniendo info de descargas: {e}")
                return {"descargas_restantes": 0, "plan_activo": None, "puede_descargar": False}

    def cancelar_suscripcion(self, user_id: int) -> bool:
        with self.get_session() as db:
            try:
                subs = db.query(Suscripcion).filter(
                    Suscripcion.user_id == user_id,
                    Suscripcion.estado == 'activa'
                ).all()

                if not subs:
                    return False

                for sub in subs:
                    sub.estado = 'cancelada'

                db.commit()
                return True
            except Exception as e:
                print(f"Error cancelando suscripción: {e}")
                db.rollback()
                return False

    def agregar_creditos(self, user_id: int, cantidad: int) -> bool:
        with self.get_session() as db:
            try:
                user = db.query(Usuario).filter(Usuario.IdUser == user_id).first()
                if user:
                    user.Creditos += cantidad
                    db.commit()
                    return True
                return False
            except Exception as e:
                print(f"Error agregando créditos: {e}")
                db.rollback()
                return False

    def resetear_descargas_gratuitas(self, user_id: int = None) -> bool:
        with self.get_session() as db:
            try:
                if user_id:
                    user = db.query(Usuario).filter(Usuario.IdUser == user_id).first()
                    if user:
                        user.DescargasGratuitas = 2
                        db.commit()
                else:
                    subq = db.query(Suscripcion.user_id).filter(
                        Suscripcion.estado == 'activa',
                        Suscripcion.fecha_expiracion > datetime.utcnow()
                    ).distinct()

                    users = db.query(Usuario).filter(Usuario.IdUser.notin_(subq)).all()
                    for u in users:
                        u.DescargasGratuitas = 2

                    db.commit()
                return True
            except Exception as e:
                print(f"Error reseteando descargas: {e}")
                db.rollback()
                return False


# Instancia global (Singleton - se crea lazy en el primer uso)
db_manager: DatabaseManager = None


def get_db_manager() -> DatabaseManager:
    """Obtiene la instancia singleton del DatabaseManager."""
    global db_manager
    if db_manager is None:
        db_manager = DatabaseManager()
    return db_manager