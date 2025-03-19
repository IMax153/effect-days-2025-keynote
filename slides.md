---
title: Keynote | Effect Days 2025
favicon: /favicon.png
theme: default
fonts:
  sans: Inter
  serif: Inter
  mono: JetBrains Mono
colorSchema: dark
---

# Building Effect-ive Agents

Exploring agentic systems with Effect

<!--
- Thank Johannes
- Excited to be here with you all this morning at Effect Days 2025

### Introduce the talk
- Building EFFECT-ive Agents
  - Explore how we can use Effect to enable building complex agentic systems
- Focus on using the simple, composable building blocks that Effect gives us
  to architect much more complex agentic systems
-->

---
layout: about-me
---

<!--
- Founding Engineer @ Effectful Technologies
  - Company driving the open-source development of effect and ecosystem libs
- Based out of New Jersey, U.S.A
- Can usually find me hacking on things related to Effect
- But I also love anything related to DevOps or infrastructure
- If that speaks to you, please find me during one of the breaks!
-->

---
layout: center
---

# What We'll Cover Today

<v-clicks>

- Why use Effect to build agentic systems?
- What makes building an agentic system complex?
- What even is an agentic system?
- How do we use Effect to build these systems?

</v-clicks>

<!--
### What We'll Cover
1. Why we, and many others, believe that Effect and its AI integrations are 
   the perfect tools for building these systems
2. Explore what makes building agentic systems so complex
   - Including strategies we can use to mitigate this complexity
3. Discuss we even mean when we use the term "agentic system"
4. Spend the majority of our talk discussing how we can use Effect to build
   such systems

### Disclaimers
- This talk is geared toward folks with at least a working knowledge of Effect
- Going to be looking at a lot of code samples in the latter half of the talk

Ok, let's get into it...
-->

---
layout: center
---

# Why Use Effect?

<div class="flex justify-center">
  <img
    src="/images/use-effect.jpeg"
    alt="A meme depicting Drake reacting negatively to React's useEffect but positively to the phrase 'Use Effect'" 
    class="h-[400px]"
  />
</div>

<!--
Let's start off by discussing why you should consider utilizing Effect for
building applications that interact with large language models (LLM).

What does Effect bring to the table and why should we use it when there are 
many other tools available?

At the core, building these applications has all the same requiremets as any 
other production grade system...
-->

---
layout: statement
---

<p class="text-4xl">
  Developing any production-grade system is hard!
</p>

<!--
Developing any production-grade system is hard! 

We as developers have a mountain of complexity to overcome in order to get a
stable system into production, especially when using TypeScript.

We need to make sure these systems are...

  - Fault Tolerant
    - Reason about how the system will behave when expected errors arise
    - System functions as expected even in the face of unexpected errors
  - Testable
    - Have the ability to make assertions about the behavior of our code
    - Have confidence that our code will work as expected when deployed 
  - Scalable
    - Not just that the system should scale with utilization
    - Codebase should be maintainable and easy to work with for developers
  - Introspectable
    - Insight into the running application via logging, tracing, and metrics
    - Alerted if something is going wrong

I think that this complexity is compounded in applications powered by large 
language model (LLM) interactions for one main reason...
-->

---
layout: fact
---

<p class="text-6xl">
  Non-Determinism
</p>

<!--
Systems powered by LLM interactions are inherently non-deterministic
  - i.e. for the same inputs, they may produce drastically different outputs
  - Can introduce substantial randomness & variability
    - Example: calling an LLM twice with the same prompt may result in different responses, different tools being used, etc.
  - In stark contrast to traditional software systems where you generally get same output for same input

Further compounded if the LLM is in control of the code paths that it takes in the application.

How do we handle all the added complexity that comes when we want to add
AI features into our applications?
-->

---
layout: center
---

<div class="max-w-150 [&_p]:text-2xl">

> In systems where non-determinism is the default, Effect is the antidote

<span class="text-sm text-gray-500"> - Maxwell Brown - Effect Meetup 2024, San Francisco</span>

</div>

<!--
### Answer: Lean into your tooling!

Not trying to be egotistical or anything, but to quote myself from last
Fall...

We want tooling which...
  - Is expressive enough to model complex behavior
  - Maintains the reliability and scalability we need
  - Can be tested without bending over backwards for frameworks
  - Provides clear insight into the running application 

All of the above and more come out-of-the-box with Effect, and so I think 
Effect really shines in the face of all this complexity.
-->

---
layout: center
---

<div class="flex justify-center">
  <img
    src="/images/effect-bot-solving-ai-chaos.webp"
    alt="A modern, high-contrast illustration of the Effect Bot as a janitor cleaning up extreme chaos in an AI development workspace" 
    class="h-[400px]"
  />
</div>

<!--
Effect provides all the tools required to handle the "chaos" that comes along 
with building AI-powered apps.

- Composability allows for building up complex systems from simple, re-usable
  components and patterns
- Define and track errors as part of the domain, to allow for clear semantics
  around how errors should be handled
- Abstract business logic into injectable services to allow for easier 
  dependency management and testing
- Instrument our code with built-in tracing, logging, and metrics to clearly
  understand what is happening in our running systems

Hopefully I've convinced you that Effect is the correct tool for handling 
the complexity that comes along with building agentic systems.

But I've been kind of using the term "agentic system" and AI application
interchangeably up till this point.

Let's talk a bit more about what I mean by the term "agentic system". 
-->

---
layout: center
---

<div class="flex flex-col gap-4">

<div>

# What is an agentic system?

</div>

<div class="flex gap-8">

<div>

### Workflows

- Execution is Pre-Determined
- Minimal Dynamicism

</div>

<div>

### Agents

- Execution is Self-Directed 
- Maximum Dynamicism

</div>

</div>

</div>

<!--
Anthropic published a blog in late December where they outlined patterns for 
building agentic systems

Defined agentic systems generally as systems that utilize LLM interactions to 
accomplish tasks

Classified these systems into two categories:

- Workflows: Code paths are pre-defined will little to no dynamicism
- Agents: LLM dynamically controls code paths taken

But at the core of any agentic system is what we they referred to as "the
augmented LLM"
-->

---
layout: center
---

# The Augmented LLM

<div class="flex justify-center">
  <img
    src="/images/augmented-llm.webp"
    alt="A flowchart depicting an LLM with augmented capabilities, namely retrieval, tools, and memory" 
    class="h-[350px]"
  />
</div>

<p class="w-full !m-0 text-xs right-0 text-end">
  Image source: Anthropic. (2024). Building Effective Agents. https://www.anthropic.com/engineering/building-effective-agents
</p>

<!--
- The augmented LLM is the basic building block that powers most, if not all, 
  agentic systems

Refers to an LLM which has been enhanced with:
- **Retrieval**: LLM can generate its own search queries over datasets
  - Ex. vector embeddings over a company's internal knowledge base
- **Tools**: LLM can select appropriate tools to use
  - Ex. giving the LLM the ability to use a web browser
- **Memory**: LLM can retain certain pieces of information
  - Can refer to the context window of the LLM request or to chat history
  - Can also refer to information saved into an external data store

Once you've got this basic building block, you can use it to put together 
much more complex and involved agentic workflows through simple composition.

From here on out, we're going to take a practical look at how Effect's AI
integrations give you all the tools you need to create an "augmented LLM".

Unfortunately, we do not have the time to get into actually implementing 
the agentic patterns that Anthropic reviews in their blog post.

However, after this talk, this repository will be open sourced and will 
contain concrete code examples of implementing the five agentic design 
patterns that Anthropic reviews in their blog.
-->

---
layout: center
---

<h2 class="mb-4">
  LLM Interactions with Effect 
</h2>

<v-click>

````md magic-move {lines:false}

```sh 
pnpm add @effect/ai
```

```sh 
pnpm add @effect/ai
pnpm add @effect/ai-anthropic
pnpm add @effect/ai-openai
```

````

</v-click>

<!--
Let's start off by discussing how we can use Effect to interact with LLM
providers, given that interacting with an LLM is a core piece of the
"augmented LLM".

This past Fall at the Effect Meetup in San Francisco, I introduced Effect's
AI integration libraries, which consist of:

Base `@effect/ai` Package
- Single unified interface which can be used to describe interactions with 
  any LLM provider

Provider Integrations
- Provide concrete implementations of the generic services from the base AI
  package
-->

---
layout: center
---

# Describing LLM Interactions 

<<< @/src/examples/001_using-effect-ai-01.ts ts {|1,9|10-12|4-7|}

<!--
### Our Goal
- Write your code focusing on business logic instead of the quirks of each 
  individual LLM provider
- Plug in which provider to use when you want to run the program

### Code Walkthrough
- For example, in this snippet we're using the `Completions` service from the 
  base `@effect/ai` package
  - Access `Completions` from the Effect environment 
  - Using it to generate text, in this case a hilarious dad joke
  - Log to console
- Adds requirement that a concrete implementation of `Completions` be provided
  before the program can be run
- Later on, if we then use our OpenAi integration package to provide the
  concrete implementation of Completions, the program would use to use OpenAi's
  Chat Completions API
- If we instead use our Anthropic integration package, we would use their
  Messages API
- But you as the developer don't have to care

We're ready to use one of Effect's provider integrations to eliminate the requirement
on `Completions` and make our program runnable.
-->

--- 
layout: center
---

# Using Provider Integrations

````md magic-move

<<< @/src/examples/002_using-provider-integrations-01.ts ts {|1|4-9|17|18|11-15}

<<< @/src/examples/002_using-provider-integrations-02.ts ts {17-20}

<<< @/src/examples/002_using-provider-integrations-03.ts ts {|1,5,14,18|8-12}

<<< @/src/examples/002_using-provider-integrations-04.ts ts {|7-8|9-12|16-21|23-}

````

<style>
/* Hide the scrollbar */
.slidev-code-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.slidev-code-wrapper::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}

/* Remove margin from code block */
.slidev-code.shiki {
  margin: 0;
}
</style>

<!--
### Using Provider Integrations
Provider-specific packages expose implementations of the services they support.

Our `getDadJoke` program needs a concrete implementation of `Completions`
to be provided to it in order to be run.

Here, we are going to use the Effect `OpenAi` integration package to get a
concrete implementation of `Completions`

### AiModel
- Import `OpenAiCompletions` module from OpenAi integration package
- In this case, we're using the `OpenAiCompletions` module from the OpenAi 
  integration package to create an `AiModel` 
- `AiModel` is a type that will allow us to provide programs with a concrete 
  implementation of a provider service 
- This `AiModel`, as indicated in its type, will give us an implementation
  of `Completions` that will use OpenAi's `gpt-4o`, and requires an `OpenAi`
  client (eventually)

### Program
  - In our main program, we need to build this `AiModel`, which we can do by 
    simply yielding it 
  - Use the built model to provide the `Completions` service to different parts 
    of our main program
  - Adds the corresponding provider's client to our requirements

### Benefits of this Approach
- Provide built models to as many programs as we want
- Mix and match providers, using different models for different interactions
  - If we know Claude from Anthropic creates some really groan-inducing dad jokes, 
    we can provide it to one of our `getDadJoke` programs 
  - Adds Anthropic's client as a requirement to our program
- Supports the service constructor pattern
  - Build models as part of the service constructor
  - Avoid leaking AI-related requirements into your service interface
  - Setting up clients for each provider is abstracted into Layer construction
-->

---
layout: center
---

# Creating Clients for Providers

````md magic-move

<<< @/src/examples/003_creating-provider-clients-01.ts ts {|10-12}

<<< @/src/examples/003_creating-provider-clients-02.ts ts {10-12|5-9|2,14-18|20-}

````

<!--
### Creating Provider Clients
Each provider exports several `Layer` constructors
- Used to create implementations of a client for that provider
- Here we're creating an OpenAi client to communicate with OpenAi's API
- `layer` constructor is useful for prototyping
- When done prototyping, the `layerConfig` constructor allows you to read
  configuration variables via Effect's `Config` module

One thing to notice in the type of both these `Layer`s is that they both have
a requirement on an `HttpClient`
- Communication with providers generally occurs over HTTP
- To avoid depending on a particular platform, we indicate that you must
  provide a platform-specific implementation of an `HttpClient`
- We are using NodeJS, so we can provide one of the builtin `NodeHttpClient`s
  we expose from `@effect/platform-node` to our OpenAi client layer

Providing this to our `main` program satisfies all requirements and now our
program is runnable!
-->

---
layout: center
---

# Handling Failure Scenarios

<v-switch class="flex flex-col justify-center items-center">

<template #1>

<img
  src="/images/uptime.png"
  alt="An up-time graph displaying OpenAi's uptime from December 2024 through March 2025" 
  class="max-h-[400px]"
/>

</template>

<template #2>

<img
  src="/images/dad-joke.webp"
  alt="An meme display a man calling a hospital and saying that his wife is in labor. The woman asks if this is her first child and the man responds, 'No, this is her husband'" 
  class="max-h-[400px]"
/>

</template>


</v-switch>

<!--
### Taking It A Step Further

When developing applications that depend on calling out to some LLM, there are many different failure scenarios that need to be properly handled:
  - Network outage
  - Provider outage 
  - Incorrect request / response formats

As a Dad, it is very important to me that when I think of a really great Dad joke, that it be delivered to my victims (ahem audience) without any issue.
-->

---
layout: center
---

# Planning Provider Interactions

````md magic-move

<<< @/src/examples/004_planning-interactions-01.ts ts {|5,7|9-}

<<< @/src/examples/004_planning-interactions-02.ts ts {1|9|10-12|7-13} 

<<< @/src/examples/004_planning-interactions-03.ts ts {14-17|15|16|8-10,15|19-}

````

<!--
### Motivation

- Let's say we've re-written the internal logic of our Dad Joke example from 
  earlier
  - `NetworkError` if network is inaccessible
  - `ProviderOutage` if the current provider we're using is down
- Now when we use `getDadJoke` our program has these errors tracked in the 
  error channel
- In the case of a `NetworkError`, it probably makes sense for us to make a 
  few attempts before failing completely, maybe with some backoff in between
- In the case of a `ProviderOutage`, we don't want to keep retrying
  - Common pattern I've seen a lot of folks implement is to just fallback to
    another LLM provider

### Code Walkthrough

To support dealing with failure scenarios gracefully, we've added support for
"planning out" LLM provider interactions via a new module called `AiPlan`.

Let's explore how we can use it to describe type of error handling logic we
want for getting our dad joke.
- We can first use the `fromModel` constructor from `AiPlan` to create an
  `AiPlan` out of the `OpenAiCompletions` `AiModel` we had previously
- The second argument to `fromModel` takes some options
  - We only want to attempt to use this OpenAi model three times
  - Each attempt should be made with an exponential backoff
  - And we only want to retry calls while we're dealing with network errors
- Just like `AiModel`, `AiPlan` tracks:
  - The services it will provides
  - The services it requires
  - But also tracks the errors that it is capable of dealing with
- But this still only addresses half of the problem - we still want to 
  fallback to a different provider if OpenAi is unavailable
- Can use `AiPlan.withFallback` to allow falling back to Anthropic for at 
  least one attempt when there is a provider outage
  - Default without a `while` is to fallback on all errors except defects
- Because we're now mixing Anthropic AND OpenAi models, both clients are
  added to the requirements
- Note that though we use the plan here, the errors are still being tracked 
  by the main program
  - Still possible that the program can fail with these errors, we've just
    added some logic around retries
  - Considering additional error handling methods for `AiPlan` module, but
    wanted to keep the API surface small for now
-->

---
layout: center
---

# Provider-Specific Configuration

````md magic-move

<<< @/src/examples/005_provider-specific-configuration-01.ts ts

<<< @/src/examples/005_provider-specific-configuration-02.ts ts {2,11-14}

<<< @/src/examples/005_provider-specific-configuration-03.ts ts {2,3,12-18}

<<< @/src/examples/005_provider-specific-configuration-04.ts ts {6-8,19-22}

````

<!--
Now, there may be some of you out there saying "Yea, this is all pretty cool,
but I can't write my code in a provider agnostic way - I need to set X
provider-specific configuration value".

That's fine, we've got you covered!

### Code Walkthrough
- Each of the provider integrations that supports it will expose a
  configuration override method which you can mix into your programs
- These configuration values are per-provider but don't alter the 
  requirements of your program
- Mix in as many provider-specific configurations as we like
  - Only if that provider is in use will the config values be applied
- Should also be noted that the `model` constructors also take a second 
  options argument which can be used to set defaults, which will then be
  overridden by any config overrides
-->

---
layout: center
---

# The Augmented LLM

<div class="flex justify-center">
  <img
    src="/images/augmented-llm.webp"
    alt="A flowchart depicting an LLM with augmented capabilities, namely retrieval, tools, and memory" 
    class="h-[350px]"
  />
</div>

<p class="w-full !m-0 text-xs right-0 text-end">
  Image source: Anthropic. (2024). Building Effective Agents. https://www.anthropic.com/engineering/building-effective-agents
</p>

<!--
So far, we've seen a bunch of the features Effect's AI integrations have for
_interacting_ with LLM providers, but we haven't really explored how we can
start building up to the "Augmented LLM" we saw earlier.

Though some providers like OpenAi are offering services such as vector stores
and file search to simplify augmenting LLM interactions, my personal opinion
is that features and services to support retrieval and memory are features
best implemented in user-land. 

This is primarily to avoid vendor lock-in and allow the flexibility of
falling back to other LLM providers in cases where you need to.

However, one feature of the augmented LLM that we DO need to use the LLM 
provider for is giving the LLM the ability to use tools.

Effect AI has a specialized module called the `AiToolkit` which is meant to
simplify adding tools to your LLM interactions.
-->

---
layout: center
---

# Defining a Tool Call 

```ts twoslash
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
//---cut---
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
)
//---cut-after---
.pipe(Layer.provide(ICanHazDadJoke.Default))

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
```
<!--
The AiToolkit allows us to define a set of tools that the LLM can utilize as
part of responding to queries.

For those unfamiliar with how tool calls work:
1. We submit a query to the LLM
2. The LLM decides it needs to use a tool and responds with
   - The tool name
   - The parameters to call the tool with

### Defining a Tool

Before we can allow the LLM to use tools, we need to:
- tell the LLM about the tools it can use 
- define the logic for our tools

First define the domain using `Schema.TaggedRequest`:

- `payload`: schema representing the input parameters for the tool call
- `success`: schema for response if executing the tool call is successful
- `failure`: schema for response if executing the tool call fails

Then we add the tool to an empty `AiToolkit` to create a set of `DadJokeTools`
now with a single tool in it.

And finally we can use the `.implement` method on the `AiToolkit` to create
handlers for each of our tools

- In this example, we are using a make believe `ICanHazDadJoke` service to
  fetch a random dad joke from the icanhazdadjoke API 

**NOTE**: examine the type of the `ToolsLayer`
-->

---
layout: center
---

# Using Tools

```ts twoslash
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

// Implement the handlers for each tool request
const ToolsLayer = DadJokeTools.implement((handlers) =>
  Effect.gen(function*() {
    const icanhazdadjoke = yield* ICanHazDadJoke
    return handlers.handle("GetDadJoke", (params) => icanhazdadjoke.search(params))
  })
).pipe(Layer.provide(ICanHazDadJoke.Default))

// Use the toolkit
//---cut---
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
//---cut-after---
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
```

<!--
Once we have the domain and the logic for our tool calls defined, we can
include the tools from an `AiToolkit` in our LLM calls.

### Code Walkthrough
- First we're yielding the `AiToolkit` to build the tools
  - **HOVER** this adds the requirement on `AiToolkit.Registry` and our tools
    to the program, which we can provide with the `ToolsLayer` from before
- Then we use `completions.toolkit` to allow us to pass both our input and 
  tools to the LLM
- And now, since our tool calls can fail, we receive an response wrapped in
  this `WithResolved` type which has several additional properties
  - In this example, we're using `.value` to access the result of the tool
    call wrapped in an `Option` since the tool may not be called

**NOTE**: Toolkit and response API are still being refined so let us know if
you have any suggestions!
-->

---
layout: center
---

# Future Directions

<v-clicks>

- Implementing Provider Services
- Model Context Protocol
- Un-Implemented Features

</v-clicks>

<!--
Alright, we covered a lot in this talk but there is so much more
functionality we did not get to explore within the AI packages.

Though we already think the packages are useful and powerful enough to start
building with, there are still many uncovered use-cases and features that
we're working to address.
- Still many provider services that we would like to create better 
  integrations for, such as OpenAi's Realtime API
- We also want to explore what we can do to support folks creating model 
  context protocol servers
  - We'll actually be hacking on that during the community day tomorrow, so
    if anyone is interested come join us!
-->

---
layout: two-cols
---

<div class="mx-18 my-32">
  <h2 class="mb-8">Thank You!</h2>
  <ul>
    <li class="flex items-center gap-4 text-xl">
      <carbon-logo-x />
      <span>@imax153</span>
    </li>
    <li class="flex items-center gap-4 text-xl">
      <carbon-logo-github />
      <span>github.com/imax153</span>
    </li>
  </ul>
</div>

::right::

<div class="flex flex-col items-center my-12">
  <div>
    <img 
      src="/images/qr.png" 
      alt="A QR code which navigates to the GitHub repository containing the code for this presentation"
      class="h-[300px]"
    />
  </div>
  <p>Scan to get the code for this presentation</p>
</div>

