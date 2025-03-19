import { Completions } from "@effect/ai"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Console, Effect } from "effect"

//        ┌─── Effect<void, AiError, Completions>
//        ▼
const getDadJoke = Effect.gen(function*() {
  const completions = yield* Completions.Completions
  return yield* completions.create("Generate a hilarious dad joke").pipe(
    Effect.andThen((response) => Console.log(response.text)),
    OpenAiCompletions.withConfigOverride({
      frequency_penalty: 1.5,
      temperature: 1.2
    })
  )
})
