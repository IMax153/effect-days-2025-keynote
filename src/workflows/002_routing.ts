import { AiInput, AiPlan, Completions } from "@effect/ai"
import { AnthropicClient, AnthropicCompletions } from "@effect/ai-anthropic"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Console, Effect, Layer, Schema, Stream, String } from "effect"

const SupportTeam = Schema.Literal("billing", "technical", "account", "product")
type SupportTeam = typeof SupportTeam.Type

const promptByTeam: Record<SupportTeam, string> = {
  billing: String.stripMargin(
    `|You are a billing support specialist. Follow these guidelines:
     |  1. Always start with "Billing Support Response:"
     |  2. First acknowledge the specific billing issue
     |  3. Explain any charges or discrepancies clearly
     |  4. List concrete next steps with timeline
     |  5. End with payment options if relevant
     |Keep responses professional but friendly.`
  ),
  technical: String.stripMargin(
    `|You are a technical support engineer. Follow these guidelines:
     |  1. Always start with "Technical Support Response:"
     |  2. List exact steps to resolve the issue
     |  3. Include system requirements if relevant
     |  4. Provide workarounds for common problems
     |  5. End with escalation path if needed
     |Use clear, numbered steps and technical details.`
  ),
  account: String.stripMargin(
    `|You are an account security specialist. Follow these guidelines:
     |  1. Always start with "Account Support Response:"
     |  2. Prioritize account security and verification
     |  3. Provide clear steps for account recovery/changes
     |  4. Include security tips and warnings
     |  5. Set clear expectations for resolution time
     |Maintain a serious, security-focused tone.`
  ),
  product: String.stripMargin(
    `|You are a product specialist. Follow these guidelines:
     |  1. Always start with "Product Support Response:"
     |  2. Focus on feature education and best practices
     |  3. Include specific examples of usage
     |  4. Link to relevant documentation sections
     |  5. Suggest related features that might help
     |Be educational and encouraging in tone.`
  )
}

export class RoutingResponse extends Schema.Class<RoutingResponse>("RoutingResponse")({
  rationale: Schema.String,
  selectedTeam: SupportTeam
}) {}

function selectTeam(ticket: string) {
  return Effect.gen(function*() {
    const completions = yield* Completions.Completions
    return yield* completions.structured({
      input: ticket,
      schema: RoutingResponse
    }).pipe(
      AiInput.provideSystem(
        String.stripMargin(
          `|Analyze the input and select the most appropriate support team from 
           |these options: ${Object.keys(promptByTeam).join(", ")}. Explain your 
           |reasoning, and provide your selection in JSON format as follows:
           |\`\`\`json
           |{
           |  "rationale":"<your-reasoning-here>",
           |  "team":"<selected-support-team-here>"
           |}
           |\`\`\``
        )
      )
    )
  })
}

function routeTicket(ticket: string, route: SupportTeam) {
  return Effect.gen(function*() {
    const completions = yield* Completions.Completions
    const system = promptByTeam[route]
    return completions.stream(ticket).pipe(
      Stream.provideService(AiInput.SystemInstruction, system)
    )
  }).pipe(Stream.unwrap)
}

// Simple model for responding to tickets
const Gpt4oMini = OpenAiCompletions.model("gpt-4o-mini")

// For categorizing tickets, we want a robust plan of execution with
// higher-quality models.
//
// The following `TicketResponsePlan` will:
//   1. First attempt to utilize OpenAi's Chat Completions API
//   2. Fallback to Anthropic's Messages API after two attempts to OpenAi
//   3. Fail completely after three attempts to Anthropic
const RoutingPlan = AiPlan.fromModel(OpenAiCompletions.model("gpt-4o"), {
  attempts: 2
}).pipe(AiPlan.withFallback({
  model: AnthropicCompletions.model("claude-3-7-sonnet-latest"),
  attempts: 3
}))

// Because we use both OpenAi and Anthropic `Completions`, our
// program will require both an `AnthropicClient` and an `OpenAiClient`
//
//       ┌─── Effect<void, AiError, AnthropicClient | OpenAiClient>
//       ▼
const program = Effect.gen(function*() {
  const gpt4oMini = yield* Gpt4oMini
  const routingPlan = yield* RoutingPlan

  const ticket = String.stripMargin(
    `|Subject: Can't access my account
     |Message: Hi, I've been trying to log in for the past hour but keep 
     |getting an 'invalid password' error. I'm sure I'm using the right 
     |password. Can you help me regain access? This is urgent as I need to 
     |submit a report by end of day.
     |- John`
  )

  const response = yield* routingPlan.provide(selectTeam(ticket)).pipe(
    Effect.andThen((response) => response.value),
    Effect.orDie
  )
  yield* Console.log(`Selected Route: ${response.selectedTeam}`)
  yield* Console.log(`Rationale: ${response.rationale}`)

  yield* routeTicket(ticket, response.selectedTeam).pipe(
    Stream.runForEach((response) =>
      Effect.sync(() => {
        process.stdout.write(response.text)
      })
    ),
    gpt4oMini.provide
  )
})

// Create a `Layer` which provides an OpenAi client
const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

// Create a `Layer` which provides an Anthropic client
const Anthropic = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

program.pipe(
  Effect.provide([OpenAi, Anthropic]),
  Effect.runPromise
)
