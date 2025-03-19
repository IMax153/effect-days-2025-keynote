import { AiInput, Completions } from "@effect/ai"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Console, Effect, Layer, String } from "effect"

const inputText = `Q3 Performance Summary:
Our customer satisfaction score rose to 92 points this quarter.
Revenue grew by 45% compared to last year.
Market share is now at 23% in our primary market.
Customer churn decreased to 5% from 8%.
New user acquisition cost is $43 per user.
Product adoption rate increased to 78%.
Employee satisfaction is at 87 points.
Operating margin improved to 34%.`

// Define the steps to execute as part of the workflow
function extract(input: string) {
  return Effect.gen(function*() {
    const completions = yield* Completions.Completions
    return yield* completions.create(input).pipe(
      AiInput.provideSystem(
        String.stripMargin(
          `|Extract only the numerical values and their associated metrics from 
           |the text. Format each as 'value: metric' on a new line.
           |
           |Example format:
           |92: customer satisfaction
           |45%: revenue growth`
        )
      )
    )
  })
}

function sanitize(input: string) {
  return Effect.gen(function*() {
    const completions = yield* Completions.Completions
    return yield* completions.create(input).pipe(
      AiInput.provideSystem(
        String.stripMargin(
          `|Convert all numerical values to percentages where possible. If not 
           |a percentage or points, convert to decimal. For example, 92 points 
           |should be converted to 92% and $43 should be converted to 43.00.Keep 
           |one number per line.
           |
           |Example format:
           |92%: customer satisfaction
           |45%: revenue growth`
        )
      )
    )
  })
}

function sort(input: string) {
  return Effect.gen(function*() {
    const completions = yield* Completions.Completions
    return yield* completions.create(input).pipe(
      AiInput.provideSystem(
        String.stripMargin(
          `|Sort all lines in descending order by numerical value. Keep the 
           |format 'value: metric' on each line.
           |
           |Example:
           |92%: customer satisfaction
           |87%: employee satisfaction`
        )
      )
    )
  })
}

function format(input: string) {
  return Effect.gen(function*() {
    const completions = yield* Completions.Completions
    return yield* completions.create(input).pipe(
      AiInput.provideSystem(
        String.stripMarginWith(
          `%Format the sorted data as a markdown table with columns:
           %  | Metric | Value |
           %  |:--|--:|
           %  | Customer Satisfaction | 92% |`,
          "%"
        )
      )
    )
  })
}

// Define the models we want to use
const Gpt4oMini = OpenAiCompletions.model("gpt-4o-mini")
const Gpt4o = OpenAiCompletions.model("gpt-4o")

// Because we used an OpenAi implementation of `Completions`, our
// program will now require us to provide an `OpenAiClient`
//
//       ┌─── Effect<void, AiError, OpenAiClient>
//       ▼
const program = Effect.gen(function*() {
  const gpt4oMini = yield* Gpt4oMini
  const gpt4o = yield* Gpt4o

  yield* Console.log(`Input text: ${inputText}\n`)

  yield* Console.log("Step 1.")
  const extracted = yield* gpt4o.provide(extract(inputText))
  yield* Console.log(extracted.text)

  yield* Console.log("\nStep 2.")
  const sanitized = yield* gpt4oMini.provide(sanitize(extracted.text))
  yield* Console.log(sanitized.text)

  yield* Console.log("\nStep 3.")
  const sorted = yield* gpt4oMini.provide(sort(sanitized.text))
  yield* Console.log(sorted.text)

  yield* Console.log("\nStep 4.")
  const formatted = yield* gpt4oMini.provide(format(sorted.text))
  yield* Console.log(formatted.text)
})

// Create a `Layer` that produces an OpenAi client
//
//      ┌─── Layer<OpenAiClient, ConfigError, HttpClient>
//      ▼
const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
})

// The OpenAi client communicates with the OpenAi API via HTTP
// so we need to provide it with an `HttpClient`
//
//      ┌─── Layer<OpenAiClient, ConfigError, never>
//      ▼
const OpenAiHttp = Layer.provide(OpenAi, NodeHttpClient.layerUndici)

// Run the program
program.pipe(
  Effect.provide(OpenAiHttp),
  Effect.runPromise
)
