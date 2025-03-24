import { AiInput, Completions } from "@effect/ai"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Console, Effect, Layer, String } from "effect"

const systemPrompt = String.stripMargin(
  `|Analyze how market changes will impact this stakeholder group. Provide 
   |specific impacts and recommended actions.Format with clear sections and 
   |priorities.`
)

const performImpactAnalysis = Effect.fn("performImpactAnalysis")(
  function*(stakeholder: string) {
    const completions = yield* Completions.Completions
    return yield* completions.create(`Stakeholder Group:\n${stakeholder}`).pipe(
      AiInput.provideSystem(systemPrompt),
      Effect.andThen((response) =>
        Console.log("=== START ANALYSIS ===").pipe(
          Effect.andThen(Console.log(`Stakeholder:\n${stakeholder}\n`)),
          Effect.andThen(Console.log(`Analysis:\n${response.text}`)),
          Effect.andThen(Console.log("=== END ANALYSIS ===\n"))
        )
      ),
      Effect.orDie
    )
  }
)

const program = Effect.gen(function*() {
  const gpt4o = yield* OpenAiCompletions.model("gpt-4o")
  yield* gpt4o.provide(
    Effect.all([
      performImpactAnalysis(String.stripMargin(
        `|Customers:
         |- Price sensitive
         |- Want better tech
         |- Environmental concerns`
      )),
      performImpactAnalysis(String.stripMargin(
        `|Investors:
         |- Expect growth
         |- Want cost control
         |- Risk concerns`
      )),
      performImpactAnalysis(String.stripMargin(
        `|Suppliers:
         |- Capacity constraints
         |- Price pressures
         |- Tech transitions`
      ))
    ], { concurrency: "unbounded" })
  )
})

const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

program.pipe(
  Effect.provide(OpenAi),
  Effect.runPromise
)
