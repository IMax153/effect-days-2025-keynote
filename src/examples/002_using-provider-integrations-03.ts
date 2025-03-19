import { AnthropicCompletions } from "@effect/ai-anthropic"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Effect } from "effect"

const Claude37 = AnthropicCompletions.model("claude-3-7-sonnet-latest")
const Gpt4o = OpenAiCompletions.model("gpt-4o")

// When you use a model from a specific provider, that provider's client
// will be added to your requirements
//
//      ┌─── Effect<void, AiError, AnthropicClient | OpenAiClient>
//      ▼
const main = Effect.gen(function*() {
  const claude = yield* Claude37
  const gpt = yield* Gpt4o
  yield* gpt.provide(getDadJoke)
  yield* gpt.provide(getDadJoke)
  yield* claude.provide(getDadJoke)
})
