import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API STALLA - Market Vendor & Stall Management",
      version: "2.0.0",
      description:
        "API REST sécurisée pour la gestion des stands, vendeurs, allocations, paiements et dettes.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Serveur local",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentification" },
      { name: "Admin", description: "Routes administrateur" },
      { name: "Vendor", description: "Routes vendeur" },
      { name: "System", description: "Routes système" },
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
  },
  apis: ["./src/routes/*.js", "./src/server.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
