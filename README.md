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
