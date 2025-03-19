import { AiPlan } from "@effect/ai"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Effect, Schedule } from "effect"

type DadJokeError = NetworkError | ProviderOutage

//        ┌─── AiPlan<DadJokeError, Completions, OpenAiClient>
//        ▼
const DadJokePlan = AiPlan.fromModel(OpenAiCompletions.model("gpt-4o"), {
  attempts: 3,
  schedule: Schedule.exponential("100 millis", 1.5),
  while: (error: DadJokeError) => error._tag === "NetworkError"
})

//     ┌─── Effect<void, DadJokeError, OpenAiClient>
//     ▼
const main = Effect.gen(function*() {
  const plan = yield* DadJokePlan
  yield* plan.provide(getDadJoke)
})
