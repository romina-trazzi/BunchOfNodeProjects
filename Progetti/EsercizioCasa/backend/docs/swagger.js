// src/docs/swagger.js
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'CRUD + Movies API',
      version: '1.0.0',
      description: 'API di esempio con Auth, Tasks e Movies (TMDB cache)',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        MoviePublic: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            tmdbId: { type: 'integer' },
            title: { type: 'string' },
            originalTitle: { type: 'string', nullable: true },
            overview: { type: 'string', nullable: true },
            releaseDate: { type: 'string', format: 'date', nullable: true },
            originalLanguage: { type: 'string', nullable: true },
            runtime: { type: 'integer', nullable: true },
            posterPath: { type: 'string', nullable: true },
            backdropPath: { type: 'string', nullable: true },
            popularity: { type: 'number', nullable: true },
            voteAverage: { type: 'number', nullable: true },
            voteCount: { type: 'integer', nullable: true }
          }
        },
        UserMoviePublic: {
          type: 'object',
          properties: {
            userId: { type: 'integer' },
            movieId: { type: 'integer' },
            favorite: { type: 'boolean' },
            watchlist: { type: 'boolean' },
            rating: { type: 'integer', nullable: true },
            notes: { type: 'string', nullable: true }
          }
        },
        UserMovieItem: {
          type: 'object',
          properties: {
            movie: { $ref: '#/components/schemas/MoviePublic' },
            userMeta: { $ref: '#/components/schemas/UserMoviePublic' }
          }
        }
      }
    }
  },
  apis: ['./src/docs/openapi.js'], // <<< qui ci sono i blocchi @openapi
});

export function mountSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}