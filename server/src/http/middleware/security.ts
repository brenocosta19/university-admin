import { FastifyReply, FastifyRequest } from "fastify";
import aj from "../config/arcjet";
import { slidingWindow } from "@arcjet/fastify";

const securityMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const role: RateLimitRole = request.user?.role ?? 'guest'
    
    let limit: number
    let message: string
    
    switch (role) {
      case 'admin':
        limit=2
        message='Admin request limit exceeded (20 per minute)'
        break
      case 'teacher':
      case 'student':
        limit=10
        message='User request limit exceeded (10 per minute). Please wait'
        break
      default:
        limit=5
        message='Guest request limit exceeded (5 per minute). Please sign up'
    }
    
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
      })
    )
    
    const decision = await client.protect(request);
    
    if (decision.isDenied() && decision.reason.isBot()) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "Automated requests are not allowed",
      });
    }
    
    if (decision.isDenied() && decision.reason.isShield()) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "Request blocked by security policy",
      });
    }
    
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return reply.status(429).send({
        error: "Too Many Requests",
        message,
      });
    }
  } catch (error) {
    request.log.error(error)
    
    return reply.status(500).send({
      error: "Internal server error",
    })
  }
  
}

export default securityMiddleware