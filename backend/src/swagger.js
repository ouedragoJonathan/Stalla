import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API STALLA - Gestion de Stands",
      version: "1.0.0",
      description: "Documentation de l'API pour la gestion de stands, vendeurs et paiements",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Serveur de développement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/server.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
