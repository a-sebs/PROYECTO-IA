import cv2
import numpy as np
import base64
import time
import os
from typing import List, Tuple
from ultralytics import YOLO
from PIL import Image
import io

class ModeloYOLO:
    def __init__(self, model_path: str = "best.pt"):
        """
        Inicializa el modelo YOLO para detección de enfermedades orales
        
        Args:
            model_path: Ruta al archivo de pesos del modelo YOLO
        """
        try:
            # Si model_path es relativo, construir ruta absoluta
            if not os.path.isabs(model_path):
                # Obtener directorio del script actual
                current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                model_path = os.path.join(current_dir, model_path)
            
            print(f"Intentando cargar modelo desde: {model_path}")
            print(f"¿El archivo existe? {os.path.exists(model_path)}")
            
            self.modelo = YOLO(model_path)
            self.input_size = (480, 480)  # Tamaño de entrada del modelo
            self.modelo_disponible = True
            print(f"✅ Modelo YOLO cargado exitosamente desde: {model_path}")
        except Exception as e:
            print(f"❌ Error al cargar el modelo YOLO: {str(e)}")
            print("El modelo funcionará en modo simulado")
            self.modelo = None
            self.input_size = (480, 480)
            self.modelo_disponible = False
        
    def _decode_image(self, imagen_base64: str) -> np.ndarray:
        """
        Decodifica una imagen en base64 a formato numpy array
        
        Args:
            imagen_base64: Imagen codificada en base64
            
        Returns:
            Imagen como numpy array en formato BGR
        """
        try:
            # Remover el prefijo data:image/... si existe
            if ',' in imagen_base64:
                imagen_base64 = imagen_base64.split(',')[1]
            
            # Decodificar base64
            imagen_bytes = base64.b64decode(imagen_base64)
            
            # Convertir a PIL Image
            pil_image = Image.open(io.BytesIO(imagen_bytes))
            
            # Convertir a RGB si es necesario
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convertir a numpy array y BGR para OpenCV
            imagen_np = np.array(pil_image)
            imagen_bgr = cv2.cvtColor(imagen_np, cv2.COLOR_RGB2BGR)
            
            return imagen_bgr
            
        except Exception as e:
            raise ValueError(f"Error al decodificar la imagen: {str(e)}")
    
    def _preprocess_image(self, imagen: np.ndarray) -> np.ndarray:
        """
        Preprocesa la imagen para el modelo YOLO
        
        Args:
            imagen: Imagen en formato numpy array (BGR)
            
        Returns:
            Imagen redimensionada y preprocesada
        """
        # Redimensionar manteniendo la relación de aspecto
        h, w = imagen.shape[:2]
        scale = min(self.input_size[0] / w, self.input_size[1] / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        # Redimensionar imagen
        imagen_resized = cv2.resize(imagen, (new_w, new_h))
        
        # Crear canvas con padding
        canvas = np.full((self.input_size[1], self.input_size[0], 3), 114, dtype=np.uint8)
        
        # Centrar la imagen en el canvas
        start_x = (self.input_size[0] - new_w) // 2
        start_y = (self.input_size[1] - new_h) // 2
        canvas[start_y:start_y + new_h, start_x:start_x + new_w] = imagen_resized
        
        return canvas
    
    def detectar_enfermedades(self, imagen_base64: str, confianza_minima: float = 0.2) -> dict:
        """
        Detecta enfermedades orales en una imagen
        
        Args:
            imagen_base64: Imagen codificada en base64
            confianza_minima: Umbral mínimo de confianza para las detecciones
            
        Returns:
            Diccionario con los resultados de la detección
        """
        start_time = time.time()
        
        try:
            # Si el modelo no está disponible, devolver resultado simulado
            if not self.modelo_disponible:
                return self._detectar_simulado(imagen_base64, start_time)
            
            # Decodificar imagen
            imagen = self._decode_image(imagen_base64)
            original_shape = imagen.shape[:2]  # (height, width)
            
            # Preprocesar imagen
            imagen_preprocessed = self._preprocess_image(imagen)
            
            # Realizar inferencia
            results = self.modelo(imagen_preprocessed, conf=confianza_minima, verbose=False)
            
            # Procesar resultados
            detecciones = []
            if results and len(results) > 0:
                result = results[0]
                
                if result.boxes is not None:
                    # Calcular factores de escala para convertir coordenadas
                    scale_x = original_shape[1] / self.input_size[0]
                    scale_y = original_shape[0] / self.input_size[1]
                    
                    for box in result.boxes:
                        # Extraer información de la detección
                        bbox = box.xyxy[0].cpu().numpy()  # [x1, y1, x2, y2]
                        confianza = float(box.conf[0].cpu().numpy())
                        clase_id = int(box.cls[0].cpu().numpy())
                        
                        # Obtener nombre de la clase
                        if hasattr(self.modelo, 'names') and clase_id in self.modelo.names:
                            nombre_clase = self.modelo.names[clase_id]
                        else:
                            nombre_clase = f"Clase_{clase_id}"
                        
                        # Escalar coordenadas de vuelta al tamaño original
                        bbox_scaled = [
                            float(bbox[0] * scale_x),
                            float(bbox[1] * scale_y),
                            float(bbox[2] * scale_x),
                            float(bbox[3] * scale_y)
                        ]
                        
                        detecciones.append({
                            "clase": nombre_clase,
                            "confianza": confianza,
                            "bbox": bbox_scaled
                        })
            
            tiempo_procesamiento = time.time() - start_time
            
            return {
                "detecciones": detecciones,
                "total_detecciones": len(detecciones),
                "tiempo_procesamiento": tiempo_procesamiento,
                "modelo_usado": "YOLO-EnfermedadesOrales",
                "tamaño_imagen": [original_shape[1], original_shape[0]]  # [width, height]
            }
            
        except Exception as e:
            return {
                "detecciones": [],
                "total_detecciones": 0,
                "tiempo_procesamiento": time.time() - start_time,
                "modelo_usado": "YOLO-EnfermedadesOrales",
                "tamaño_imagen": [0, 0],
                "error": str(e)
            }
    
    def _detectar_simulado(self, imagen_base64: str, start_time: float) -> dict:
        """
        Modo simulado cuando el modelo real no está disponible
        """
        try:
            # Decodificar imagen para obtener dimensiones
            imagen = self._decode_image(imagen_base64)
            original_shape = imagen.shape[:2]
            
            # Simular detecciones
            detecciones_simuladas = [
                {
                    "clase": "gingivitis",
                    "confianza": 0.75,
                    "bbox": [100.0, 50.0, 200.0, 150.0]
                },
                {
                    "clase": "caries",
                    "confianza": 0.65,
                    "bbox": [300.0, 200.0, 380.0, 280.0]
                }
            ]
            
            tiempo_procesamiento = time.time() - start_time
            
            return {
                "detecciones": detecciones_simuladas,
                "total_detecciones": len(detecciones_simuladas),
                "tiempo_procesamiento": tiempo_procesamiento,
                "modelo_usado": "YOLO-EnfermedadesOrales-Simulado",
                "tamaño_imagen": [original_shape[1], original_shape[0]]
            }
            
        except Exception as e:
            return {
                "detecciones": [],
                "total_detecciones": 0,
                "tiempo_procesamiento": time.time() - start_time,
                "modelo_usado": "YOLO-EnfermedadesOrales-Simulado",
                "tamaño_imagen": [480, 480],
                "error": str(e)
            }
    
    def detectar_lote(self, imagenes_base64: List[str], confianza_minima: float = 0.2) -> List[dict]:
        """
        Detecta enfermedades orales en un lote de imágenes
        
        Args:
            imagenes_base64: Lista de imágenes codificadas en base64
            confianza_minima: Umbral mínimo de confianza para las detecciones
            
        Returns:
            Lista de resultados de detección
        """
        resultados = []
        
        for i, imagen_base64 in enumerate(imagenes_base64):
            try:
                resultado = self.detectar_enfermedades(imagen_base64, confianza_minima)
                resultados.append({
                    "indice": i,
                    "resultado": resultado,
                    "error": resultado.get("error")
                })
            except Exception as e:
                resultados.append({
                    "indice": i,
                    "resultado": None,
                    "error": str(e)
                })
        
        return resultados
    
    def get_model_info(self) -> dict:
        """
        Obtiene información sobre el modelo
        
        Returns:
            Diccionario con información del modelo
        """
        info = {
            "modelo": "YOLO para detección de enfermedades orales",
            "tamaño_entrada": self.input_size,
            "disponible": self.modelo_disponible,
            "clases": []
        }
        
        if self.modelo_disponible and hasattr(self.modelo, 'names'):
            info["clases"] = list(self.modelo.names.values())
            info["num_clases"] = len(self.modelo.names)
        else:
            # Información simulada cuando el modelo no está disponible
            info["clases"] = ["gingivitis", "caries", "periodontitis", "ulcera", "normal"]
            info["num_clases"] = 5
            info["modo"] = "simulado"
        
        return info
    
    def _obtener_texto_personalizado(self, nombre_clase: str, confianza: float) -> str:
        """
        Genera texto personalizado para cada tipo de detección
        
        Args:
            nombre_clase: Nombre de la clase detectada
            confianza: Nivel de confianza de la detección
            
        Returns:
            Texto personalizado para mostrar en el bbox
        """
        textos_personalizados = {
            'caries': f"CARIES ({confianza:.0%})",
            'gingivitis': f"GINGIVITIS ({confianza:.0%})",
            'calculus': f"SARRO ({confianza:.0%})",
            'ulcer': f"ULCERA ({confianza:.0%})",
            'hypodontia': f"HIPODONCIA ({confianza:.0%})",
            'tooth_discolation': f"DECOLORACION ({confianza:.0%})"
        }
        
        return textos_personalizados.get(nombre_clase, f"❓ {nombre_clase.upper()} ({confianza:.0%})")
    
    def detectar_con_visualizacion(self, imagen_base64: str, confianza_minima: float = 0.2) -> bytes:
        """
        Detecta enfermedades orales y retorna la imagen con bboxes dibujados
        
        Args:
            imagen_base64: Imagen codificada en base64
            confianza_minima: Umbral mínimo de confianza para las detecciones
            
        Returns:
            bytes: Imagen en formato JPEG con detecciones dibujadas
        """
        try:
            # Decodificar imagen
            imagen = self._decode_image(imagen_base64)
            imagen_original = imagen.copy()
            
            if not self.modelo_disponible:
                return self._crear_imagen_simulada(imagen_original)
            
            # Preprocesar imagen para el modelo
            imagen_preprocessed = self._preprocess_image(imagen)
            
            # Realizar inferencia
            results = self.modelo(imagen_preprocessed, conf=confianza_minima, verbose=False)
            
            # Dibujar detecciones en la imagen original
            if results and len(results) > 0:
                result = results[0]
                
                if result.boxes is not None:
                    # Calcular factores de escala
                    h_orig, w_orig = imagen_original.shape[:2]
                    scale_x = w_orig / self.input_size[0]
                    scale_y = h_orig / self.input_size[1]
                    
                    for box in result.boxes:
                        # Extraer información de la detección
                        bbox = box.xyxy[0].cpu().numpy()  # [x1, y1, x2, y2]
                        confianza = float(box.conf[0].cpu().numpy())
                        clase_id = int(box.cls[0].cpu().numpy())
                        
                        # Obtener nombre de la clase
                        if hasattr(self.modelo, 'names') and clase_id in self.modelo.names:
                            nombre_clase = self.modelo.names[clase_id]
                        else:
                            nombre_clase = f"Clase_{clase_id}"
                        
                        # Escalar coordenadas de vuelta al tamaño original
                        x1 = int(bbox[0] * scale_x)
                        y1 = int(bbox[1] * scale_y)
                        x2 = int(bbox[2] * scale_x)
                        y2 = int(bbox[3] * scale_y)
                        
                        # Definir colores para cada clase
                        colores = {
                            'caries': (0, 0, 255),      # Rojo
                            'gingivitis': (255, 0, 0),  # Azul
                            'calculus': (0, 165, 255),  # Naranja
                            'ulcer': (255, 0, 255),     # Magenta
                            'hypodontia': (0, 255, 255), # Amarillo
                            'tooth_discolation': (128, 0, 128) # Púrpura
                        }
                        
                        color = colores.get(nombre_clase, (0, 255, 0))  # Verde por defecto
                        
                        # Dibujar bbox
                        cv2.rectangle(imagen_original, (x1, y1), (x2, y2), color, 3)  # Línea más gruesa
                        
                        # Dibujar etiquetas de texto con porcentaje
                        # Obtener texto personalizado con porcentaje
                        etiqueta = self._obtener_texto_personalizado(nombre_clase, confianza)
                        tamaño_texto = cv2.getTextSize(etiqueta, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
                        
                        # Calcular posición del fondo del texto
                        padding = 5
                        fondo_x1 = x1
                        fondo_y1 = y1 - tamaño_texto[1] - (padding * 2)
                        fondo_x2 = x1 + tamaño_texto[0] + (padding * 2)
                        fondo_y2 = y1
                        
                        # Asegurar que el fondo no se salga de la imagen
                        if fondo_y1 < 0:
                            fondo_y1 = y2
                            fondo_y2 = y2 + tamaño_texto[1] + (padding * 2)
                        
                        # Dibujar fondo semi-transparente para el texto
                        overlay = imagen_original.copy()
                        cv2.rectangle(overlay, (fondo_x1, fondo_y1), (fondo_x2, fondo_y2), color, -1)
                        cv2.addWeighted(overlay, 0.8, imagen_original, 0.2, 0, imagen_original)
                        
                        # Dibujar borde del fondo
                        cv2.rectangle(imagen_original, (fondo_x1, fondo_y1), (fondo_x2, fondo_y2), (255, 255, 255), 1)
                        
                        # Dibujar texto con sombra para mejor legibilidad
                        texto_x = fondo_x1 + padding
                        texto_y = fondo_y1 + tamaño_texto[1] + padding
                        
                        # Sombra del texto (negro)
                        cv2.putText(imagen_original, etiqueta, (texto_x + 1, texto_y + 1),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 3)
                        
                        # Texto principal (blanco)
                        cv2.putText(imagen_original, etiqueta, (texto_x, texto_y),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            # Convertir imagen a bytes
            _, imagen_encoded = cv2.imencode('.jpg', imagen_original)
            return imagen_encoded.tobytes()
            
        except Exception as e:
            # En caso de error, retornar imagen original sin modificar
            imagen = self._decode_image(imagen_base64)
            _, imagen_encoded = cv2.imencode('.jpg', imagen)
            return imagen_encoded.tobytes()
    
    def _crear_imagen_simulada(self, imagen: np.ndarray) -> bytes:
        """
        Crea una imagen simulada con detecciones de ejemplo (solo bboxes)
        """
        # Dibujar algunas detecciones simuladas sin etiquetas
        
        # Caries simulada (solo bbox rojo)
        cv2.rectangle(imagen, (100, 50), (200, 150), (0, 0, 255), 3)
        
        # Gingivitis simulada (solo bbox azul)
        cv2.rectangle(imagen, (300, 200), (380, 280), (255, 0, 0), 3)
        
        # Texto indicando modo simulado (mantenemos este para información)
        cv2.rectangle(imagen, (10, 5), (250, 35), (0, 255, 255), -1)
        cv2.putText(imagen, "MODO SIMULADO", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
        
        # Convertir a bytes
        _, imagen_encoded = cv2.imencode('.jpg', imagen)
        return imagen_encoded.tobytes()
