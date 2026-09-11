# AapatSuchana

A Nepal hazard reporting application with a React/Vite frontend and a Django REST API backend.

## Run the application

Start the Django API in one terminal:

```powershell
& backend/.venv/Scripts/python.exe backend/manage.py migrate
& backend/.venv/Scripts/python.exe backend/manage.py runserver
```

Start React in a second terminal:

```powershell
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://127.0.0.1:8000`.

## Free Google sign-in setup

Google sign-in uses Google Identity Services and the existing Django JWT session. Google verifies the Gmail/Google account and its verified email address; no paid service is required.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. Configure the OAuth consent screen. For local development, use **External** and add your Google account as a test user if the app is still in testing.
3. Create an OAuth client under **APIs & Services > Credentials > Create credentials > OAuth client ID**. Choose **Web application**.
4. Add `http://localhost:5173` under **Authorized JavaScript origins**.
5. Copy the client ID and set it before starting Vite:

   ```powershell
   $env:VITE_GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
   ```

6. Set the same client ID for Django before starting the API:

   ```powershell
   $env:GOOGLE_OAUTH_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
   ```

Restart both servers after setting these variables. The Google button appears on the sign-in/sign-up page, and Django rejects tokens whose Google email is not verified or whose client ID does not match.

## Public login

Use **Sign up** in the application with an email address and a password of at least six characters. The account is created in Django and then logged in automatically. Later, use the same email and password with **Sign in**.

## Employee login

An employee must have both a normal Django user account and an active `EmployeeAccount` record with the same email address.

1. Create an administrator:

   ```powershell
   & backend/.venv/Scripts/python.exe backend/manage.py createsuperuser
   ```

2. Open `http://127.0.0.1:8000/admin/` and sign in.
3. Under **Users**, create the employee's email and password.
4. Under **Employee accounts**, create an active record with exactly the same email.
5. Use **Employee?** on the frontend and sign in with those credentials.

Employee accounts can view pending incidents and update incident status and verification fields. Public users can only see approved incidents.

## API endpoints

- `POST /api/auth/register/` creates a public user account.
- `POST /api/auth/token/` returns JWT access and refresh tokens.
- `GET /api/auth/me/` returns the current user and employee status.
- `GET /api/incidents/` lists incidents according to the user's access.
- `POST /api/incidents/` creates a pending incident.
- `PATCH /api/incidents/<id>/` updates an incident for active employees.
