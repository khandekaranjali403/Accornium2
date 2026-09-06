# FinBank Complete Backend Modules

## Authentication
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/send-login-otp?email=anjali@gmail.com
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password

OTP login flow:

1. `POST /api/auth/send-otp` with `{ "email": "anjali@gmail.com" }`. Save the returned `email`.
2. `POST /api/auth/verify-otp` with `{ "email": "anjali@gmail.com", "otp": "123456" }`.
3. Save the returned `token` and call `GET /api/dashboard` with `Authorization: Bearer <token>`.

### Email OTP setup

OTP requests print the code to the backend console by default. To send real emails, configure SMTP before starting the application:

```powershell
$env:MAIL_ENABLED="true"
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-gmail-app-password"
$env:MAIL_FROM="your-email@gmail.com"
mvn spring-boot:run
```

For Gmail, use an app password with 2-Step Verification enabled. Do not use your normal account password. Use `POST /api/auth/send-otp` with `{ "email": "user@example.com" }` or `?email=user@example.com`.

## Dashboard
GET /api/dashboard

## Accounts
GET /api/accounts
POST /api/accounts

POST body:
{
  "type": "SAVINGS",
  "openingBalance": 10000,
  "branch": "Andheri, Mumbai"
}

## Transactions
GET /api/transactions

## Beneficiaries
GET /api/beneficiaries
POST /api/beneficiaries

## Transfers
GET /api/transfers
POST /api/transfers

{
  "sourceAccountId": 1,
  "beneficiaryId": 1,
  "amount": 1000,
  "remarks": "Rent"
}

## Payments & Bills
GET /api/payments/bills
POST /api/payments/bills

{
  "accountId": 1,
  "billType": "MOBILE",
  "provider": "Jio",
  "customerReference": "9876543210",
  "amount": 599
}

## Cards
GET /api/cards
PATCH /api/cards/{id}/freeze?value=true
PATCH /api/cards/{id}/freeze?value=false

## Profile
GET /api/profile
PUT /api/profile

{
  "name": "Anjali Sharma"
}

## Notifications
GET /api/notifications
PATCH /api/notifications/{id}/read

## Loans
GET /api/loans
POST /api/loans/{id}/pay

{
  "accountId": 1,
  "amount": 12500
}

## Statements
GET /api/statements
POST /api/statements/generate?accountId=1&period=Last%203%20Months

## Demo user

Email: anjali@gmail.com
Password: Password@123

The DataInitializer creates demo accounts, card, beneficiary and loan automatically.

## Important production note

This implementation is suitable as a project/demo foundation. A real banking system needs transaction locking/concurrency controls, idempotency keys, audit trails, MFA/step-up authentication, limits, fraud controls, encryption/key management, proper statement generation/storage, payment-provider integration, database migrations, rate limiting and production secret management.
