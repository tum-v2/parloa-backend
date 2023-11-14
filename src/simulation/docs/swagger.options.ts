export const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Parloa Simulation API Documentation',
      version: '1.0.0',
      description: 'Documentation for Parloa Simulation APIs',
    },
  },
  apis: ['./src/simulation/router/*.ts'], // Path to the API routes in your project
};
