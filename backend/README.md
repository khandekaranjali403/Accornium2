# FinBank Backend

Spring Boot 4.0.1 + Java 25 + MySQL + Spring Security + JWT.

## 1. Requirements

- Java 25
- Maven 3.9+
- MySQL 8+
- IntelliJ IDEA / Eclipse / VS Code

## 2. Database

Create the database:

```sql
CREATE DATABASE finbank;
```

Update `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

Change the password to your local MySQL password.

## 3. Run

```bash
mvn clean install
mvn spring-boot:run
```

The running application uses MySQL and persists API changes immediately. The default local connection is `jdbc:mysql://localhost:3306/finbank` with username `root` and password `root`. For another MySQL installation, configure these before starting:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/finbank?useSSL=false&serverTimezone=Asia/Kolkata"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-mysql-password"
mvn spring-boot:run
```

Verify the connection at `http://localhost:8080/api/health`. Signup, transfers, payments, loan payments, profile changes, and other API writes are saved in MySQL; subsequent GET requests read the current database state.

API:

`http://localhost:8080`

## Deployment

Deploy the `frontend` folder to Vercel with:

- Build command: `npm run build`
- Output directory: `build`
- Environment variable: `REACT_APP_API_BASE_URL=https://YOUR-BACKEND-DOMAIN`

Deploy the `backend` folder to Railway or Render using the included `Dockerfile` and set:

- `DB_URL=jdbc:mysql://YOUR-MYSQL-HOST:3306/finbank?useSSL=false&serverTimezone=UTC`
- `DB_USERNAME=YOUR_MYSQL_USER`
- `DB_PASSWORD=YOUR_MYSQL_PASSWORD`
- `FRONTEND_URL=https://YOUR-VERCEL-DOMAIN`
- `JWT_SECRET=YOUR_LONG_RANDOM_SECRET` and update `app.jwt.secret` to read it if externalizing secrets

The backend honors the hosting platform's `PORT` variable. Vercel is suitable for the React frontend, but this Spring Boot backend must run on a JVM/container service. Use a managed MySQL provider such as Railway MySQL, Aiven, PlanetScale, or Amazon RDS; do not use an in-memory database in production.

## 4. Authentication APIs

### Signup

POST `/api/auth/signup`

```json
{
  "name": "Anjali Sharma",
  "email": "anjali@gmail.com",
  "password": "Password@123"
}
```

### Login

POST `/api/auth/login`

```json
{
  "email": "anjali@gmail.com",
  "password": "Password@123"
}
```

Response:

```json
{
  "token": "JWT_TOKEN",
  "userId": 1,
  "name": "Anjali Sharma",
  "email": "anjali@gmail.com",
  "message": "Login successful"
}
```

Use the token for protected APIs:

`Authorization: Bearer JWT_TOKEN`

### Send Login OTP

POST `/api/auth/send-login-otp?email=anjali@gmail.com`

The demo OTP is printed in the backend console.

### Enable OTP email with SMTP

The React **Resend OTP** button calls `POST /api/auth/send-otp`. The backend sends the generated code through `EmailService` when `MAIL_ENABLED` is `true`.

For Gmail, create an app password first, then set these environment variables before starting Spring Boot. Do not commit the password.

PowerShell:

```powershell
$env:MAIL_ENABLED = "true"
$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "your-address@gmail.com"
$env:MAIL_PASSWORD = "your-16-character-app-password"
$env:MAIL_FROM = "your-address@gmail.com"
$env:MAIL_SMTP_AUTH = "true"
$env:MAIL_SMTP_STARTTLS = "true"
mvn spring-boot:run
```

With SMTP disabled, the OTP is printed to the backend console for local development. With SMTP enabled, signup, login, and **Resend OTP** send the code to the supplied email address.

### Verify OTP

POST `/api/auth/verify-otp`

```json
{
  "email": "anjali@gmail.com",
  "otp": "123456"
}
```

### Forgot Password

POST `/api/auth/forgot-password`

```json
{
  "email": "anjali@gmail.com"
}
```

### Reset Password

POST `/api/auth/reset-password`

```json
{
  "email": "anjali@gmail.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

### Current User

GET `/api/users/me`

Header:

`Authorization: Bearer JWT_TOKEN`

## 5. React integration

Login example:

```js
const response = await fetch("http://localhost:9090/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();

if (response.ok) {
  localStorage.setItem("token", data.token);
  window.location.href = "/dashboard";
}
```

Protected API:

```js
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:9090/api/users/me", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Security notes

This is a development/demo foundation. For a real banking system, add:
- HTTPS
- secrets from environment variables/secret manager
- refresh-token rotation
- rate limiting and account lockout
- real email/SMS OTP provider
- audit logging
- transaction authorization / step-up authentication
- CSRF strategy appropriate to the chosen auth architecture
- database migrations with Flyway/Liquibase
- production CORS policy
- encryption/key management
- fraud detection and monitoring
