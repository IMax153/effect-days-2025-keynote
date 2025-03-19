import { Completions } from "@effect/ai"
import { Console, Effect } from "effect"

// Using the `Completions` service will add it to your program's requirements
//
//        ┌─── Effect<void, AiError, Completions>
//        ▼
const getDadJoke = Effect.gen(function*() {
  const completions = yield* Completions.Completions
  return yield* completions.create("Generate a hilarious dad joke").pipe(
    Effect.andThen((response) => Console.log(response.text))
  )
})
