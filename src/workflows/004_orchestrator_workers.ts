import { AiInput, Completions } from "@effect/ai"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Console, Effect, Layer, Schema, String } from "effect"

const orchestratorSystemPrompt = String.stripMargin(
  `|Analyze the user-provided task and break it down into 2-3 distinct 
   |approaches.
   |
   |Return your response in the following JSON format:
   |
   |\`\`\`json
   |{
   |  "analysis": "<YOUR_ANALYSIS_OF_APPROACHES_HERE>",
   |  "tasks": [
   |    {
   |      "type": "formal",
   |      "description": "<YOUR_FORMAL_TASK_DESCRIPTION_HERE>"
   |    },
   |    {
   |      "type": "conversational",
   |      "description": "<YOUR_CONVERSATIONAL_TASK_DESCRIPTION_HERE>"
   |    }
   |  ]
   |}
   |\`\`\``
)

const workerSystemPrompt = String.stripMargin(
  `|Generate content based on the following user-defined elements. Your content 
   |should maintain the specified style and fully address all requirements.`
)

class Task extends Schema.Class<Task>("Task")({
  type: Schema.Literal("formal", "conversational"),
  description: Schema.String.annotations({
    description: "If the \"type\" is \"formal\", write a precise, technical " +
      "version that emphasizes specifications. If the task \"type\" is " +
      "\"conversational\", write an engaging, friendly version that connects with readers"
  })
}) {
  static Array = Schema.Array(this)
  static encodeTasks = Schema.encodeSync(Schema.parseJson(this.Array, {
    space: 2
  }))
}

class TaskList extends Schema.Class<TaskList>("TaskList")({
  analysis: Schema.String.annotations({
    description: "Represents your explanation of your understanding of the " +
      "task and which variations would be valuable - focus on how each approach " +
      "serves different aspects of the task"
  }),
  tasks: Task.Array
}, {
  description: "An object containing an initial task analysis along with both a " +
    "formal and conversational description of the task"
}) {}

const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

class FlexibleOrchestrator extends Effect.Service<FlexibleOrchestrator>()("FlexibleOrchestrator", {
  dependencies: [OpenAi],
  effect: Effect.gen(function*() {
    const gpt4o = yield* OpenAiCompletions.model("gpt-4o")

    const generateTaskList = Effect.fn("FlexibleOrchestrator.generateTaskList")(
      function*(task: string) {
        const completions = yield* Completions.Completions
        return yield* completions.structured({
          input: `Task: ${task}`,
          schema: TaskList
        }).pipe(
          AiInput.provideSystem(orchestratorSystemPrompt),
          Effect.andThen((response) => response.value),
          Effect.tapErrorTag("NoSuchElementException", () => Console.error("[ERROR]: Malformed task list")),
          Effect.orDie
        )
      }
    )

    const process = Effect.fn("FlexibleOrchestrator.process")(
      function*(task: string) {
        const completions = yield* Completions.Completions

        // Step 1: Get orchestrator response
        const response = yield* generateTaskList(task)
        yield* Console.log("=== ORCHESTRATOR OUTPUT ===\n")
        yield* Console.log(`ANALYSIS:\n\n${response.analysis}\n`)
        yield* Console.log(`TASKS:\n\n${Task.encodeTasks(response.tasks)}\n`)

        // Step 2: Process each task concurrently
        yield* Effect.forEach(
          response.tasks,
          (taskInfo) =>
            completions.create(String.stripMargin(
              `|- Task: ${task}
               |- Style: ${taskInfo.type}
               |- Guidelines: ${taskInfo.description}`
            )).pipe(
              AiInput.provideSystem(workerSystemPrompt),
              Effect.andThen((response) =>
                Console.log(`=== WORKER RESULT (${taskInfo.type}) ===\n\n${response.text}\n`)
              )
            ),
          { concurrency: "unbounded", discard: true }
        )
      }
    )

    return {
      process: (task: string) => gpt4o.provide(process(task))
    } as const
  })
}) {}

const program = Effect.gen(function*() {
  const orchestrator = yield* FlexibleOrchestrator
  const task = "Write a product description for a new eco-friendly water bottle"
  yield* orchestrator.process(task)
})

program.pipe(
  Effect.provide([FlexibleOrchestrator.Default]),
  Effect.runPromise
)
