# OPIUM - Secure Password Manager

A modern, secure password manager built with Next.js and FastAPI.

## Features

- 🔒 Secure password storage with encryption
- 👥 Password sharing capabilities
- 📱 Modern, responsive UI
- 🔑 JWT-based authentication
- 🎨 Beautiful dark theme
- 📊 Password strength meter
- 🔄 Real-time updates

## Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- React

### Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Pydantic

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL
- Docker (optional)

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/opium.git
cd opium
```

2. Set up the backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:

```bash
cd frontend
npm install
```

4. Create environment files:

Backend (.env):

```
DATABASE_URL=postgresql://user:password@localhost:5432/opium
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Frontend (.env.local):

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

5. Start the development servers:

Backend:

```bash
cd backend
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Production Deployment

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Set up production environment variables
3. Deploy using your preferred hosting service (e.g., Vercel for frontend, Heroku for backend)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)
