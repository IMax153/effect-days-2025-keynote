import type { Completions } from "@effect/ai"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Effect } from "effect"

type GetDadJokeError = NetworkError | ProviderOutage

declare const getDadJoke: Effect.Effect<void, GetDadJokeError, Completions.Completions>

//     ┌─── Effect<void, GetDadJokeError, OpenAiClient>
//     ▼
const main = Effect.gen(function*() {
  const gpt4o = yield* OpenAiCompletions.model("gpt-4o")
  yield* gpt4o.provide(getDadJoke)
})

