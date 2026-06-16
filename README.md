# MultiUser Chat System

## Descripción

MultiUser Chat System es una aplicación web de mensajería en tiempo real desarrollada con FastAPI, React y MySQL. El proyecto permite que múltiples usuarios se registren, autentiquen y participen en salas de chat compartidas mediante comunicación basada en WebSockets.

El sistema fue diseñado siguiendo una arquitectura modular orientada a servicios, permitiendo una futura migración hacia una arquitectura basada en microservicios.

---

## Características

* Registro de usuarios.
* Inicio de sesión mediante JWT.
* Gestión de usuarios autenticados.
* Creación de salas de chat.
* Unión a salas existentes.
* Mensajería en tiempo real mediante WebSockets.
* Comunicación simultánea entre múltiples usuarios.
* Hash seguro de contraseñas utilizando bcrypt.
* Arquitectura modular y escalable.

---

## Tecnologías Utilizadas

### Backend

* FastAPI
* SQLAlchemy
* MySQL
* JWT (python-jose)
* Passlib
* WebSockets

### Frontend

* React
* TypeScript
* Vite
* Axios

### Base de Datos

* MySQL

---

## Arquitectura del Proyecto

### Backend

```text
app/
├── auth_service/
├── users_service/
├── rooms_service/
├── messages_service/
├── websocket_service/
├── database/
├── shared/
└── main.py
```

### Frontend

```text
src/
├── components/
├── pages/
├── services/
├── hooks/
└── App.tsx
```

---

## Funcionalidades Implementadas

### Autenticación

* Registro de usuarios.
* Inicio de sesión.
* Generación de JWT.
* Protección de rutas.
* Validación de credenciales.

### Gestión de Usuarios

* Creación de cuentas.
* Consulta de información del usuario autenticado.

### Salas de Chat

* Creación de salas.
* Unión a salas existentes.
* Administración de participantes.

### Mensajería en Tiempo Real

* Comunicación mediante WebSockets.
* Distribución de mensajes a todos los usuarios conectados.
* Actualización instantánea sin recargar la página.

---

## Seguridad

* Contraseñas almacenadas mediante hashing con bcrypt.
* Autenticación basada en JWT.
* Validación de datos mediante Pydantic.
* Protección de endpoints mediante OAuth2PasswordBearer.

---

## Objetivos de Aprendizaje

Durante el desarrollo de este proyecto se aplicaron conceptos relacionados con:

* Desarrollo Backend con FastAPI.
* Diseño de APIs REST.
* WebSockets.
* Autenticación y autorización.
* Bases de datos relacionales.
* Arquitectura Cliente-Servidor.
* Arquitecturas escalables.
* Comunicación en tiempo real.

---

## Posibles Mejoras Futuras

* Mensajes privados.
* Persistencia completa del historial de mensajes.
* Notificaciones en tiempo real.
* Despliegue en la nube.
* Migración a microservicios.
* Integración con Docker y Kubernetes.

---

## Autor

Luis Fernando Hernandez Perez

Ingeniería en Sistemas Computacionales

ESCOM - Instituto Politécnico Nacional
