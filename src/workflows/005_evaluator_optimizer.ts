import { AiInput, Completions } from "@effect/ai"
import { AnthropicClient, AnthropicCompletions } from "@effect/ai-anthropic"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Console, Effect, Layer, Schema, String } from "effect"

const generatorSystemPrompt = String.stripMargin(
  `|Your goal is to complete the user-provided task. If there is any feedback 
   |from your previous generations, you should reflect on them and use them to 
   |improve your solution.
   |
   |Output your answer concisely in the following JSON format: 
   |
   |\`\`\`json
   |{
   |  "thoughts": "<YOUR_THOUGHTS_HERE>",
   |  "solution": "<YOUR_SOLUTION_HERE>"
   |}
   |\`\`\``
)

const evaluatorSystemPrompt = String.stripMargin(
  `|Evaluate this following code implementation for:
   |1. code correctness
   |2. time complexity
   |3. style and best practices
   |
   |Requirements:
   |- You should be evaluating only and not attemping to solve the task
   |- Only output "PASS" if all criteria are met and you have no further 
   |  suggestions for improvements
   |
   |Output your evaluation concisely in the following JSON format:
   |
   |\`\`\`json
   |{
   |  "evaluation": "<YOUR_EVALUATION_HERE>",
   |  "feedback": "<YOUR_FEEDBACK_HERE>"
   |}
   |\`\`\``
)

class Generation extends Schema.Class<Generation>("Generation")({
  thoughts: Schema.String.annotations({
    description: "Your understanding of the task and feedback and how you plan to improve"
  }),
  solution: Schema.String.annotations({
    description: "Your solution to the task written in TypeScript code"
  })
}) {}

class Evaluation extends Schema.Class<Evaluation>("Evaluation")({
  status: Schema.Literal("PASS", "NEEDS_IMPROVEMENT", "FAIL").annotations({
    description: "PASS if the solution meets all requirements, NEEDS_IMPROVEMENT " +
      "if the solution partially meets the requirements but requires some adjustment " +
      "or FAIL if the solution does not meet any of the requirements"
  }),
  feedback: Schema.String.annotations({
    description: "What parts of the solution need improvement and why"
  })
}) {}

const generate = Effect.fn("generate")(
  function*(task: string, context: string = "") {
    const completions = yield* Completions.Completions

    // Prepend context to the prompt if present
    const prompt = `${context.length === 0 ? "" : context + "\n"}Task: ${task}`

    const response = yield* completions.structured({
      input: prompt,
      schema: Generation
    }).pipe(
      AiInput.provideSystem(generatorSystemPrompt),
      Effect.andThen((response) => response.value),
      Effect.tapErrorTag("NoSuchElementException", () => Console.error("[ERROR]: Malformed generation")),
      Effect.orDie
    )

    yield* Console.log("=== GENERATION START ===")
    yield* Console.log(`Thoughts:\n${response.thoughts}\n`)
    yield* Console.log(`Solution:\n${response.solution}`)
    yield* Console.log("=== GENERATION END ===\n")

    return response
  }
)

const evaluate = Effect.fn("evaluate")(
  function*(task: string, solution: string) {
    const completions = yield* Completions.Completions

    const prompt = `Original Task: ${task}\nSolution to Evaluate: ${solution}`

    const response = yield* completions.structured({
      input: prompt,
      schema: Evaluation
    }).pipe(
      AiInput.provideSystem(evaluatorSystemPrompt),
      Effect.andThen((response) => response.value),
      Effect.tapErrorTag("NoSuchElementException", () => Console.error("[ERROR]: Malformed evaluation")),
      Effect.orDie
    )

    yield* Console.log("=== EVALUATION START ===")
    yield* Console.log(`Status: ${response.status}\n`)
    yield* Console.log(`Feedback:\n${response.feedback}`)
    yield* Console.log("=== EVALUATION END ===\n")

    return response
  }
)

const program = Effect.gen(function*() {
  // Use a lower fidelity model for the generations (to try to force a few generations)
  const claude = yield* AnthropicCompletions.model("claude-3-5-haiku-latest")
  // Use a higher fidelity model for evaluations
  const gpt4o = yield* OpenAiCompletions.model("gpt-4o")

  const task = String.stripMargin(
    `|Task:
     |
     |Implement a Stack data structure in TypeScript meant to store numbers 
     |which implements the following methods:
     |1. push(x)
     |2. pop()
     |3. getMin()
     |
     |All operations should be O(1)`
  )

  const memory: Array<string> = []

  // Create the initial generation and add it to memory
  const generation = yield* claude.provide(generate(task))
  memory.push(generation.solution)

  // Loop until we find a solution (can setup a maximum number of generations, if desired)
  while (true) {
    // Evaluate the solution
    const evaluation = yield* gpt4o.provide(evaluate(task, generation.solution))

    if (evaluation.status === "PASS") {
      yield* Console.log("=== FINAL SOLUTION ===")
      yield* Console.log(`${generation.solution}`)
      yield* Console.log("=== FINAL SOLUTION ===\n")
      break
    }

    // Provide previous solutions and feedback to the next generation attempt
    const previousAttempts = memory.map((solution) => `- ${solution}\n`)
    const context = String.stripMargin(
      `|Previous Attempts:
       |${previousAttempts}
       |
       |Feedback:
       |${evaluation.feedback}`
    )

    // Perform the next generation with the added context
    const nextGeneration = yield* claude.provide(generate(task, context))
    memory.push(nextGeneration.solution)
  }
})

const Anthropic = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

program.pipe(
  Effect.provide([Anthropic, OpenAi]),
  Effect.runPromise
)
