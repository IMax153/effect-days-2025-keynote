import { Completions } from "@effect/ai"
import { AnthropicCompletions } from "@effect/ai-anthropic"
import { OpenAiCompletions } from "@effect/ai-openai"
import { Console, Effect } from "effect"

const Gpt4o = OpenAiCompletions.model("gpt-4o", {
  temperature: 0.8
})

//        ┌─── Effect<void, AiError, Completions>
//        ▼
const getDadJoke = Effect.gen(function*() {
  const completions = yield* Completions.Completions
  return yield* completions.create("Generate a hilarious dad joke").pipe(
    Effect.andThen((response) => Console.log(response.text)),
    AnthropicCompletions.withConfigOverride({
      temperature: 1.4
    }),
    OpenAiCompletions.withConfigOverride({
      frequency_penalty: 1.5,
      temperature: 1.2
    })
  )
})
