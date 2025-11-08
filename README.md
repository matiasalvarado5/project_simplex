# Simplex Solver

Aplicación web que resuelve problemas de *Programación Lineal* utilizando el *Método Simplex*.  
El objetivo es brindar una herramienta intuitiva para que usuarios no expertos puedan definir y resolver problemas de optimización.

---

## Tecnologías
- *Lenguaje:* Go (Golang)  
- *Framework Web:* Gin
- *Base de datos:* PostgreSQL (para almacenamiento de problemas y resultados) (en revisión)
- *Frontend:* HTML, CSS, JavaScript (interfaz básica e intuitiva)  

---

## Metodología
Se utilizará una metodología *Ágil (Scrum)* con iteraciones cortas (*Sprints*) para entregar incrementos funcionales del sistema.  

- *Product Owner:* Profesor  
- *Scrum Master:* Alvarado Matías  

## Equipo de desarrollo
- Alvarado Matías  
- Díaz Bellomo Emiliano Agustín  
- Marín Franco  
- Godoy Bautista  
- Valdivieso Gabriel  
- Mendez Jesus  

---

## Product Backlog inicial (Historias de usuario)
1. Como usuario, quiero ingresar la función objetivo y restricciones, para obtener la solución óptima del problema.  
2. Como usuario, quiero visualizar las tablas intermedias del método Simplex, para entender el proceso de resolución paso a paso.  
3. Como usuario, quiero que el sistema maneje más variables y restricciones, para resolver problemas más complejos.  
4. Como usuario, quiero exportar los resultados a PDF, para guardarlos y compartirlos fácilmente.  
5. Como usuario, quiero que el sistema valide mis entradas, para evitar errores con datos inconsistentes.  

--- 

## Sprint 0 — Preparación
*Objetivo:* Formar el equipo, asignar roles, configurar el entorno de trabajo y elaborar el Product Backlog inicial.  

*Tareas realizadas*
- Creación del repositorio en GitHub.  
- Configuración inicial del proyecto en Go.  
- Definición de roles del equipo.  
- Creación del tablero en GitHub Projects.  
- Product Backlog inicial con las primeras historias de usuario.  

---

## Sprint 1 — El MVP (Motor de cálculo)
*Objetivo:* Entregar una versión funcional básica (el motor de cálculo).

*Tareas realizadas:*
- Se implementó el motor de cálculo base.
- El motor es capaz de maximizar y minimizar.
- Se verificó el funcionamiento correcto de la lógica principal.

---

## Sprint 2 — La Interfaz
*Objetivo:* Dotar al software de una interfaz usable.

*Tareas realizadas:*
- Se diseñó el prototipo visual de la interfaz del sistema.
- Se implementó la interfaz principal con formularios dinámicos para el ingreso de coeficientes y restricciones.
- Se conectó la interfaz al motor para mostrar los resultados básicos (solución óptima y valor) en la vista.

---

## Sprint 3 — Funcionalidad y Calidad
*Objetivo:* Añadir funcionalidades clave y robustecer el sistema.

*Tareas realizadas:*
- Se implementó un sistema básico de validación de entradas.
- Se validó que los campos de ingreso sean numéricos.
- Se verificó que los campos estén completos antes de enviar.
- Se implementó la funcionalidad de exportación de resultados a PDF.
- Se integró el botón de "Exportar PDF" en la interfaz de usuario.

---
## Sprint 4 — El Cierre y la Entrega Final
*Objetivo:* Pulir el producto, documentar y preparar la entrega final.

*Tareas realizadas:*
- Se creó la plantilla del PDF asegurando que sea legible y con secciones bien definidas.
- Se validó la correcta exportación de las tablas y resultados finales.
- Redacción del manual de usuario y documentación final del código.
---