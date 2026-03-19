/**
 * TESTS DE RATING
 *
 * Testea el endpoint PATCH /api/movies/:id/rating
 * que actualiza la valoración (0-5) de una película.
 */

const request = require('supertest');

// ============================================
// CONFIGURACIÓN DE MOCKS
// ============================================
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  movie: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('../lib/prisma', () => mockPrisma);

jest.mock('../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { userId: 'user-123' };
    next();
  };
});

const app = require('../server');
const prisma = require('../lib/prisma');

// ============================================
// SUITE DE TESTS: RATING
// ============================================
describe('API de Rating', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/movies/:id/rating', () => {

    it('debería actualizar el rating a un valor válido (0-5)', async () => {
      // ARRANGE
      const peliculaMock = {
        id: 'movie-1',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        posterUrl: 'https://example.com/inception.jpg',
        isFavorite: false,
        rating: 0,
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const peliculaActualizada = { ...peliculaMock, rating: 4 };

      prisma.movie.findFirst.mockResolvedValue(peliculaMock);
      prisma.movie.update.mockResolvedValue(peliculaActualizada);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 4 });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(4);
      expect(prisma.movie.findFirst).toHaveBeenCalledWith({
        where: { id: 'movie-1', ownerId: 'user-123' },
      });
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 'movie-1' },
        data: { rating: 4 },
      });
    });

    it('debería aceptar rating 0', async () => {
      // ARRANGE
      const peliculaMock = {
        id: 'movie-1',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        posterUrl: 'https://example.com/inception.jpg',
        isFavorite: false,
        rating: 5,
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const peliculaActualizada = { ...peliculaMock, rating: 0 };

      prisma.movie.findFirst.mockResolvedValue(peliculaMock);
      prisma.movie.update.mockResolvedValue(peliculaActualizada);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 0 });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(0);
    });

    it('debería aceptar rating 5', async () => {
      // ARRANGE
      const peliculaMock = {
        id: 'movie-1',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        posterUrl: 'https://example.com/inception.jpg',
        isFavorite: false,
        rating: 0,
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const peliculaActualizada = { ...peliculaMock, rating: 5 };

      prisma.movie.findFirst.mockResolvedValue(peliculaMock);
      prisma.movie.update.mockResolvedValue(peliculaActualizada);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 5 });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(5);
    });

    it('debería devolver 400 si rating es mayor a 5', async () => {
      // ARRANGE
      // (no necesitamos mockear Prisma porque la validación ocurre antes)

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 6 });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entero entre 0 y 5');
      expect(prisma.movie.findFirst).not.toHaveBeenCalled();
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 400 si rating es negativo', async () => {
      // ARRANGE
      // (no necesitamos mockear Prisma porque la validación ocurre antes)

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: -1 });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entero entre 0 y 5');
      expect(prisma.movie.findFirst).not.toHaveBeenCalled();
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 400 si rating no es entero', async () => {
      // ARRANGE
      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 3.5 });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entero entre 0 y 5');
      expect(prisma.movie.findFirst).not.toHaveBeenCalled();
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 400 si el rating es un string', async () => {
      // ARRANGE
      // ACT
      const response = await request(app)
          .patch('/api/movies/movie-1/rating')
          .set('Authorization', 'Bearer fake-token')
          .send({ rating: '4' });
  
      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entero entre 0 y 5');
      expect(prisma.movie.findFirst).not.toHaveBeenCalled();
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 400 si no se envía rating', async () => {
      // ARRANGE
      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entero entre 0 y 5');
      expect(prisma.movie.findFirst).not.toHaveBeenCalled();
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 404 si la película no existe', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue(null);

      // ACT
      const response = await request(app)
        .patch('/api/movies/no-existe/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 4 });

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Película no encontrada');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 404 si la película pertenece a otro usuario', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue(null);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-otro-user/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 4 });

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Película no encontrada');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 500 si ocurre un error en el servidor', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockRejectedValue(new Error('DB connection error'));

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 4 });

      // ASSERT
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error al actualizar el rating');
    });
  });
});