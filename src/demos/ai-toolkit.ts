import { AiToolkit, Completions } from "@effect/ai"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { NodeHttpClient } from "@effect/platform-node"
import { Array, Config, Console, Effect, Layer, Schema } from "effect"

class DadJoke extends Schema.Class<DadJoke>("DadJoke")({
  id: Schema.String,
  joke: Schema.String
}) {}

class SearchResponse extends Schema.Class<SearchResponse>("SearchResponse")({
  results: Schema.Array(DadJoke)
}) {}

class ICanHazDadJoke extends Effect.Service<ICanHazDadJoke>()("ICanHazDadJoke", {
  dependencies: [NodeHttpClient.layerUndici],
  effect: Effect.gen(function*() {
    const httpClient = yield* HttpClient.HttpClient
    const httpClientOk = httpClient.pipe(
      HttpClient.filterStatusOk,
      HttpClient.mapRequest(HttpClientRequest.prependUrl("https://icanhazdadjoke.com"))
    )

    const search = Effect.fn("ICanHazDadJoke.search")(
      function*(params: typeof GetDadJoke.Type) {
        return yield* httpClientOk.get("/search", {
          acceptJson: true,
          urlParams: { ...params }
        }).pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(SearchResponse)),
          Effect.flatMap(({ results }) => Array.head(results)),
          Effect.map((joke) => joke.joke),
          Effect.scoped,
          Effect.orDie
        )
      }
    )

    return {
      search
    } as const
  })
}) {}

// Create the tool request
class GetDadJoke extends Schema.TaggedRequest<GetDadJoke>()("GetDadJoke", {
  payload: {
    searchTerm: Schema.String.annotations({
      description: "The search term to use to find dad jokes"
    })
  },
  success: Schema.String,
  failure: Schema.Never
}, {
  description: "Get a hilarious dad joke from the icanhazdadjoke API"
}) {}

// Add tool requests to an AiToolkit
const DadJokeTools = AiToolkit.empty.add(GetDadJoke)

// Implement the handlers for each tool
const ToolsLayer = DadJokeTools.implement((handlers) =>
  Effect.gen(function*() {
    const icanhazdadjoke = yield* ICanHazDadJoke
    return handlers.handle("GetDadJoke", (params) => icanhazdadjoke.search(params))
  })
).pipe(Layer.provide(ICanHazDadJoke.Default))

// Use the toolkit
const getDadJoke = Effect.gen(function*() {
  const completions = yield* Completions.Completions
  const tools = yield* DadJokeTools
  return yield* completions.toolkit({
    input: "Generate a hilarious dad joke",
    tools
  }).pipe(
    Effect.andThen((response) => response.value),
    Effect.andThen((value) => Console.log(value))
  )
})

const program = Effect.gen(function*() {
  const model = yield* OpenAiCompletions.model("gpt-4o")
  yield* model.provide(getDadJoke)
})

const OpenAiLayer = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

program.pipe(
  Effect.provide([OpenAiLayer, ToolsLayer]),
  Effect.runPromise
)
