import arcjet, { detectBot, shield, tokenBucket, slidingWindow } from "@arcjet/fastify";

if (!process.env.ARCJET_KEY && process.env.NODE_ENV !== 'test') {
  throw new Error('ARCJET_KEY env is required')
}

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '10s',
      max: 60,
    })
  ],
});

export default aj