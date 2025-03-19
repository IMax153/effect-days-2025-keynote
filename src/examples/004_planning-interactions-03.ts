import { AiPlan } from "@effect/ai"
import { AnthropicCompletions } from "@effect/ai-anthropic"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Effect, Schedule } from "effect"

type DadJokeError = NetworkError | ProviderOutage

//        ┌─── AiPlan<DadJokeError, Completions, AnthropicClient | OpenAiClient>
//        ▼
const DadJokePlan = AiPlan.fromModel(OpenAiCompletions.model("gpt-4o"), {
  attempts: 3,
  schedule: Schedule.exponential("100 millis", 1.5),
  while: (error: DadJokeError) => error._tag === "NetworkError"
}).pipe(AiPlan.withFallback({
  model: AnthropicCompletions.model("claude-3-7-sonnet-latest"),
  while: (error: DadJokeError) => error._tag === "ProviderOutage"
}))

//     ┌─── Effect<void, DadJokeError, AnthropicClient | OpenAiClient>
//     ▼
const main = Effect.gen(function*() {
  const plan = yield* DadJokePlan
  yield* plan.provide(getDadJoke)
})
