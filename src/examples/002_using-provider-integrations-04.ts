import { AnthropicCompletions } from "@effect/ai-anthropic"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Effect } from "effect"

class DadJokes extends Effect.Service<DadJokes>()("DadJokes", {
  effect: Effect.gen(function*() {
    const claude = yield* AnthropicCompletions.model("claude-3-7-sonnet-latest")
    const gpt = yield* OpenAiCompletions.model("gpt-4o")
    return {
      getDadJoke: gpt.provide(getDadJoke),
      getReallyGroanInducingDadJoke: claude.provide(getDadJoke)
    }
  })
}) {}

//     ┌─── Effect<void, AiError, DadJokes>
//     ▼
const main = Effect.gen(function*() {
  const dadJokes = yield* DadJokes
  yield* dadJokes.getReallyGroanInducingDadJoke
})

//          ┌─── Layer<DadJokes, never, AnthropicClient | OpenAiClient>
//          ▼
DadJokes.Default
