import { OpenAiClient } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Effect, Layer } from "effect"

// Create a `Layer` which produces an `OpenAiClient` and requires
// an `HttpClient`.
//
//      ┌─── Layer<OpenAiClient, never, HttpClient>
//      ▼
const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
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
