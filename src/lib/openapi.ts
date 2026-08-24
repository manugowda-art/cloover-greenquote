export const openapiSpec = {
  openapi: "3.0.3",

  info: {
    title: "GreenQuote API",
    version: "1.0.0",
    description: "Solar financing pre-qualification API",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],

  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "session",
      },
    },

    schemas: {
      QuoteInput: {
        type: "object",
        required: [
          "address",
          "monthlyConsumptionKwh",
          "systemSizeKw",
        ],
        properties: {
          address: {
            type: "string",
            example: "123 Green Street",
          },
          monthlyConsumptionKwh: {
            type: "number",
            example: 400,
          },
          systemSizeKw: {
            type: "number",
            example: 6,
          },
          downPayment: {
            type: "number",
            example: 1000,
          },
        },
      },

      Offer: {
        type: "object",
        properties: {
          termYears: {
            type: "integer",
            example: 5,
          },
          apr: {
            type: "number",
            example: 0.069,
          },
          principalUsed: {
            type: "number",
            example: 6200,
          },
          monthlyPayment: {
            type: "number",
            example: 122.47,
          },
        },
      },
    },
  },

  paths: {
    "/api/health": {
      get: {
        summary: "Liveness check",
        responses: {
          "200": {
            description: "Application is alive",
          },
        },
      },
    },

    "/api/auth/register": {
      post: {
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password"],
                properties: {
                  fullName: { type: "string" },
                  email: {
                    type: "string",
                    format: "email",
                  },
                  password: {
                    type: "string",
                    format: "password",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered",
          },
          "400": {
            description: "Invalid input",
          },
          "409": {
            description: "Email already registered",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  password: {
                    type: "string",
                    format: "password",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
          },
          "401": {
            description: "Invalid email or password",
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        summary: "Logout",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Logged out",
          },
        },
      },
    },

    "/api/quotes": {
      get: {
        summary: "List current user's quotes",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Quotes returned",
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },

      post: {
        summary: "Create pre-qualification quote",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/QuoteInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Quote created",
          },
          "400": {
            description: "Invalid input",
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },

    "/api/quotes/{id}": {
      get: {
        summary: "Get quote details",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Quote returned",
          },
          "403": {
            description: "Forbidden",
          },
          "404": {
            description: "Quote not found",
          },
        },
      },
    },

    "/api/admin/quotes": {
      get: {
        summary: "List all quotes as admin",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Filter by user name or email",
          },
        ],
        responses: {
          "200": {
            description: "Quotes returned",
          },
          "403": {
            description: "Admin access required",
          },
        },
      },
    },
  },
};