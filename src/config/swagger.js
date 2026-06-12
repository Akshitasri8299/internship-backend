const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internship & Recruitment Management API',
      version: '1.0.0',
      description:
        'REST API for managing internship postings, candidate applications, and recruiter/admin dashboards.'
    },
    servers: [
      {
        url: '/api',
        description: 'Base API path'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
