const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Landmark Developers Employee Attendance Tracking System API',
      version: '1.0.0',
      description: 'Enterprise REST API specification for Landmark Developers GPS Geofenced Attendance & HR Management Platform.',
      contact: {
        name: 'Landmark Developers Engineering Team',
        email: 'support@landmarkdevelopers.com',
        url: 'https://landmarkdevelopers.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server'
      },
      {
        url: 'https://api.landmarkdevelopers.com/api',
        description: 'Production Cloud Server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'HTTP-only JWT Authentication Cookie'
        }
      }
    },
    security: [
      {
        cookieAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
