# Accornium — Company Website

Full-stack website for **Accornium**, a software development company.
- Frontend: React (responsive, react-router)
- Backend: Java Spring Boot (REST API, JPA, H2 in-memory DB, contact form endpoint)

## Project Structure
```
accornium/
  frontend/   React app (pages: Home, About, Services, Portfolio, Contact)
  backend/    Spring Boot app (Maven, contact form REST API)
```

## Running the Backend
Requires Java 17+, Maven, and a running MySQL server (8.x recommended).

1. Create the database (or let the app auto-create it via `createDatabaseIfNotExist=true`):
   ```sql
   CREATE DATABASE accorniumdb;
   ```
2. Update credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/accorniumdb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_password_here
   ```
3. Run it:
   ```
   cd backend
   mvn spring-boot:run
   ```

- API runs at: http://localhost:8080
- Health check: GET /api/health
- Submit contact form: POST /api/contact
- List messages: GET /api/contact
- Hibernate (`spring.jpa.hibernate.ddl-auto=update`) will auto-create the `contact_messages` table on first run.

## Running the Frontend
Requires Node.js 18+.
```
cd frontend
npm install
npm start
```
- App runs at: http://localhost:3000
- Copy `.env.example` to `.env` to point the frontend at a different backend URL.

## Build for Production
```
cd frontend
npm run build
```
```
cd backend
mvn clean package
java -jar target/accornium-backend-1.0.0.jar
```

## Pages
- **Home** — hero, stats, services overview, CTA
- **About** — company values, team
- **Services** — full service list
- **Portfolio** — sample project cards
- **Contact** — form that POSTs to the Spring Boot `/api/contact` endpoint

## Notes
- CORS is preconfigured in `CorsConfig.java` to allow `http://localhost:3000`.
- Fully responsive layout (desktop, tablet, mobile) via CSS in `frontend/src/App.css`.
