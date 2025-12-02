# University Platform API Gateway

Central API Gateway for all university platform microservices.

## Installation

```bash
npm install
```

## Start Gateway

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

## Endpoints

- **Health Check**: `GET http://localhost:4000/health`
- **Landing Auth**: `POST http://localhost:4000/api/auth/*`
- **Login Auth**: `POST http://localhost:4000/auth/*`
- **Analytics**: `GET/POST http://localhost:4000/api/analytics/*`
- **Reports**: `GET/POST http://localhost:4000/api/reports/*`
- **Timetable**: `GET/POST http://localhost:4000/api/timetable/*`
- **Repository**: `GET/POST http://localhost:4000/api/repository/*`
- **Students**: `GET/POST http://localhost:4000/api/students/*`
|
