import sqlite3
import hashlib
from datetime import datetime  # timedelta no se usa actualmente
import pytz
from typing import Optional, Dict, Any

class DatabaseManager:
    def __init__(self, db_path: str = "usuarios.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Inicializar la base de datos y crear las tablas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Crear tabla de usuarios
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                IdUser INTEGER PRIMARY KEY AUTOINCREMENT,
                NombreUser TEXT NOT NULL,
                ApellidoUser TEXT NOT NULL,
                EmailUser TEXT UNIQUE NOT NULL,
                ClaveUser TEXT NOT NULL,
                Creditos INTEGER DEFAULT 1050,
                UltimaRecarga DATETIME DEFAULT CURRENT_TIMESTAMP,
                FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                DescargasGratuitas INTEGER DEFAULT 2
            )
        ''')
        
        # Crear tabla de suscripciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS suscripciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                plan_tipo VARCHAR(20) NOT NULL,
                fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_expiracion DATETIME NOT NULL,
                estado VARCHAR(20) DEFAULT 'activa',
                precio DECIMAL(10,2),
                FOREIGN KEY (user_id) REFERENCES usuarios(IdUser)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password: str) -> str:
        """Hashear contraseña usando SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def crear_usuario(self, nombre: str, apellido: str, email: str, password: str) -> Dict[str, Any]:
        """Crear un nuevo usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verificar si el email ya existe
            cursor.execute("SELECT EmailUser FROM usuarios WHERE EmailUser = ?", (email,))
            if cursor.fetchone():
                return {"success": False, "error": "El email ya está registrado"}
            
            # Crear usuario
            password_hash = self.hash_password(password)
            cursor.execute('''
                INSERT INTO usuarios (NombreUser, ApellidoUser, EmailUser, ClaveUser, Creditos, DescargasGratuitas)
                VALUES (?, ?, ?, ?, 1050, 2)
            ''', (nombre, apellido, email, password_hash))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return {
                "success": True, 
                "user_id": user_id,
                "message": "Usuario creado exitosamente"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def validar_usuario(self, email: str, password: str) -> Dict[str, Any]:
        """Validar credenciales de usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            password_hash = self.hash_password(password)
            cursor.execute('''
                SELECT IdUser, NombreUser, ApellidoUser, EmailUser, Creditos 
                FROM usuarios 
                WHERE EmailUser = ? AND ClaveUser = ?
            ''', (email, password_hash))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    "success": True,
                    "user": {
                        "id": user[0],
                        "nombre": user[1],
                        "apellido": user[2],
                        "email": user[3],
                        "creditos": user[4]
                    }
                }
            else:
                return {"success": False, "error": "Credenciales incorrectas"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def obtener_usuario(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Obtener información de usuario por ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT IdUser, NombreUser, ApellidoUser, EmailUser, Creditos, UltimaRecarga
                FROM usuarios 
                WHERE IdUser = ?
            ''', (user_id,))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    "id": user[0],
                    "nombre": user[1],
                    "apellido": user[2],
                    "email": user[3],
                    "creditos": user[4],
                    "ultima_recarga": user[5]
                }
            return None
            
        except Exception as e:
            print(f"Error obteniendo usuario: {e}")
            return None
    
    def usar_creditos(self, user_id: int, cantidad: int = 150) -> Dict[str, Any]:
        """Usar créditos del usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Obtener créditos actuales
            cursor.execute("SELECT Creditos FROM usuarios WHERE IdUser = ?", (user_id,))
            result = cursor.fetchone()
            
            if not result:
                return {"success": False, "error": "Usuario no encontrado"}
            
            creditos_actuales = result[0]
            
            if creditos_actuales < cantidad:
                return {"success": False, "error": "Créditos insuficientes"}
            
            # Restar créditos
            nuevos_creditos = creditos_actuales - cantidad
            cursor.execute('''
                UPDATE usuarios 
                SET Creditos = ? 
                WHERE IdUser = ?
            ''', (nuevos_creditos, user_id))
            
            conn.commit()
            conn.close()
            
            return {
                "success": True, 
                "creditos_restantes": nuevos_creditos,
                "creditos_usados": cantidad
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def recargar_creditos_diarios(self):
        """Recargar créditos de todos los usuarios a medianoche (UTC-5)"""
        try:
            # Zona horaria de Colombia (UTC-5)
            colombia_tz = pytz.timezone('America/Bogota')
            # ahora = datetime.now(colombia_tz)  # Variable no utilizada actualmente
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Obtener usuarios que necesitan recarga (última recarga hace más de 2 horas para testing)
            cursor.execute('''
                SELECT IdUser, UltimaRecarga FROM usuarios
                WHERE datetime(UltimaRecarga) < datetime('now', '-2 hours')
            ''')
            
            usuarios_para_recarga = cursor.fetchall()
            
            for user_id, ultima_recarga in usuarios_para_recarga:
                cursor.execute('''
                    UPDATE usuarios 
                    SET Creditos = 1050, UltimaRecarga = CURRENT_TIMESTAMP
                    WHERE IdUser = ?
                ''', (user_id,))
            
            conn.commit()
            conn.close()
            
            return len(usuarios_para_recarga)
            
        except Exception as e:
            print(f"Error recargando créditos: {e}")
            return 0
    
    def crear_suscripcion(self, user_id: int, plan_tipo: str, dias_duracion: int, precio: float = 0.0) -> bool:
        """Crear una nueva suscripción"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Calcular fecha de expiración
            cursor.execute("SELECT datetime('now', '+{} days')".format(dias_duracion))
            fecha_expiracion = cursor.fetchone()[0]
            
            cursor.execute('''
                INSERT INTO suscripciones (user_id, plan_tipo, fecha_expiracion, precio)
                VALUES (?, ?, ?, ?)
            ''', (user_id, plan_tipo, fecha_expiracion, precio))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error creando suscripción: {e}")
            return False
    
    def verificar_suscripcion_activa(self, user_id: int) -> Optional[str]:
        """Verificar si el usuario tiene suscripción activa y retornar el tipo"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT plan_tipo FROM suscripciones 
                WHERE user_id = ? AND estado = 'activa' 
                AND fecha_expiracion > datetime('now')
                ORDER BY fecha_expiracion DESC
                LIMIT 1
            ''', (user_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else None
            
        except Exception as e:
            print(f"Error verificando suscripción: {e}")
            return None
    
    def decrementar_descarga_gratuita(self, user_id: int) -> bool:
        """Decrementar las descargas gratuitas del usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE usuarios 
                SET DescargasGratuitas = DescargasGratuitas - 1
                WHERE IdUser = ? AND DescargasGratuitas > 0
            ''', (user_id,))
            
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            return affected_rows > 0
            
        except Exception as e:
            print(f"Error decrementando descarga: {e}")
            return False
    
    def obtener_info_descargas(self, user_id: int) -> Dict[str, Any]:
        """Obtener información de descargas del usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT DescargasGratuitas FROM usuarios WHERE IdUser = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            plan_activo = self.verificar_suscripcion_activa(user_id)
            
            conn.close()
            
            return {
                "descargas_restantes": result[0] if result else 0,
                "plan_activo": plan_activo,
                "puede_descargar": bool(plan_activo or (result and result[0] > 0))
            }
            
        except Exception as e:
            print(f"Error obteniendo info de descargas: {e}")
            return {"descargas_restantes": 0, "plan_activo": None, "puede_descargar": False}
    
    def cancelar_suscripcion(self, user_id: int) -> bool:
        """Cancelar la suscripción activa del usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Cancelar todas las suscripciones activas del usuario
            cursor.execute('''
                UPDATE suscripciones 
                SET estado = 'cancelada' 
                WHERE user_id = ? AND estado = 'activa'
            ''', (user_id,))
            
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            return affected_rows > 0
            
        except Exception as e:
            print(f"Error cancelando suscripción: {e}")
            return False
    
    def agregar_creditos(self, user_id: int, cantidad: int) -> bool:
        """Agregar créditos a un usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE usuarios 
                SET Creditos = Creditos + ? 
                WHERE IdUser = ?
            ''', (cantidad, user_id))
            
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            return affected_rows > 0
            
        except Exception as e:
            print(f"Error agregando créditos: {e}")
            return False
    
    def resetear_descargas_gratuitas(self, user_id: int = None) -> bool:
        """Resetear las descargas gratuitas a 2 para un usuario específico o todos los usuarios"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if user_id:
                # Resetear para un usuario específico
                cursor.execute('''
                    UPDATE usuarios 
                    SET DescargasGratuitas = 2
                    WHERE IdUser = ?
                ''', (user_id,))
                print(f"Descargas gratuitas reseteadas para usuario {user_id}")
            else:
                # Resetear para todos los usuarios que no tienen plan activo
                cursor.execute('''
                    UPDATE usuarios 
                    SET DescargasGratuitas = 2
                    WHERE IdUser NOT IN (
                        SELECT DISTINCT user_id FROM suscripciones 
                        WHERE activa = 1 AND fecha_fin > datetime('now')
                    )
                ''')
                print(f"Descargas gratuitas reseteadas para {cursor.rowcount} usuarios")
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            print(f"Error reseteando descargas gratuitas: {e}")
            return False

# Instancia global
db_manager = DatabaseManager()
