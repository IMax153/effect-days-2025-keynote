import { OpenAiCompletions } from "@effect/ai-openai"
import { Effect } from "effect"

// Create an `AiModel` which will provide an implementation of `Completions`
// and requires an `OpenAiClient`
//
//      ┌─── AiModel<Completions, OpenAiClient>
//      ▼
const Gpt4o = OpenAiCompletions.model("gpt-4o")

// When you use a model from a specific provider, that provider's client 
// will be added to your requirements
//
//      ┌─── Effect<void, AiError, OpenAiClient>
//      ▼
const main = Effect.gen(function*() {
  const gpt = yield* Gpt4o
  yield* gpt.provide(getDadJoke)
  yield* gpt.provide(getDadJoke)
  yield* gpt.provide(getDadJoke)
})
