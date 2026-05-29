import { fastify } from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider
} from "fastify-type-provider-zod"
import { fastifySwagger } from "@fastify/swagger"
import { fastifyCors } from "@fastify/cors"
import ScalarApiReference from "@scalar/fastify-api-reference"
import { subjectsRoutes } from "./http/routes/subjects"
import securityMiddleware from "./http/middleware/security"
import { auth } from "./lib/auth"
import { fromNodeHeaders } from "better-auth/node";
import { usersRoutes } from "./http/routes/users"
import { classesRoutes } from "./http/routes/classes"



const app = fastify().withTypeProvider<ZodTypeProvider>()


app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: process.env.FRONTEND_URL ?? false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ],
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API School Admin Dashboard',
      description: 'This is the backend for a school admin dashboard',
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform
})

app.register(ScalarApiReference, {
  routePrefix: '/docs'
})

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);
      
      // Convert Fastify headers to standard Headers object
      const headers = fromNodeHeaders(request.headers);
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error, "Authentication Error:");
      return reply.status(500).send({ 
        error: "Internal authentication error",
        code: "AUTH_FAILURE"
      });
    }
  }
});

app.register(async (protectedApp) => {

  protectedApp.addHook(
    "preHandler",
    securityMiddleware
  )

  protectedApp.register(subjectsRoutes, {
    prefix: "/api/subjects"
  })
  
  protectedApp.register(usersRoutes, {
    prefix: "/api/users"
  })
  
  protectedApp.register(classesRoutes, {
    prefix: "/api/classes"
  })
})

app.listen({port: 3000}).then(() => {
  console.log("Servidor rodando")
})