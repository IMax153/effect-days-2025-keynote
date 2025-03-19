import { OpenAiClient } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Effect, Layer, Redacted } from "effect"

// Create a `Layer` which produces an `OpenAiClient` and requires
// an `HttpClient`.
//
//      ┌─── Layer<OpenAiClient, never, HttpClient>
//      ▼
const OpenAi = OpenAiClient.layer({
  apiKey: Redacted.make("my-secret-openai-api-key")
})

// Provide a platform-specific implementation of `HttpClient`
//
//        ┌─── Layer<OpenAiClient, never, never>
//        ▼
const OpenAiWithHttp = Layer.provide(OpenAi, NodeHttpClient.layerUndici)

main.pipe(
  Effect.provide(OpenAiWithHttp),
  Effect.runPromise
)
