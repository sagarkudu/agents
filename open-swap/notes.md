- agents have capacity to take actions.
- The core of Agents is Think <-> Act <-> Observe <-> Think
- The classic definition of an AI agent is "An entity that percieves its environment and takes actions to maximze goals.

### Why use Agents?

Defining a system prompt along with 1000 lines of news RAG will burn huge number of input tokens.

```
const systemPrompt = `You are a helpful assistant that recommends open-source alternatives
based on a user's request.

Use the recent open-source news below to avoid making outdated recommendations.
If recent news changes the recommendation, explain that clearly.

Recent open-source news:

${JSON.stringify(openSourceNewsItems)}`;
```

Solution:
E.g The Loop for our Agent with a News Tool

THINK -> Based on the current context, do I need to retrieve the latest open source news or reply to the user.
ACT -> Run a local function to retreive the latest open source news.
OBSERVE -> Once the latest news is retreived, send it back to the model to reason about.

Building it this way helps us to avoid this problem where we stuff all the context we need the model to be aware about the system prompt and make our request cause too many tokens.

### Defining an AI agent

1. AI Model

- The "Brain" that reasons and plans.
  e.g Reasons about your trip and plans the next actions.

2. Tools

- API and functions to act on the world.
  e.g Hands, feet, computer systems, and anything else.

3. Loop

- Code that cycles thought and action.
  e.g Recieves and send information to think about.

4. Stop rule

- Stop when goals are met.
  e.g Once the iternary is ready, the agent's work is done.

That's when the agent's work is done. Keep in mind aboth of its core i.e Think <-> Act <-> Observe loop in mind because they will remain true even as APIs and libraries changes

#### Ways to build Agents

- Using LLMStack, Autogen, LangChain etc
- But we are going to focus to create agents using openai library.

#### What is a tool calling?

- A tool is a piece of functionality that a model decides to use when it needs specific data or actions to fulfill instructions.
  e.g get_weather(location)
  Retreives real-time weather data for a city.

issue_refund(order_id)
Process a refund for lost or damaged orders.

E.g The Loop for our Agent with a News Tool

THINK -> Based on the current context, do I need to retrieve the latest open source news or reply to the user.
ACT -> Run a local function to retreive the latest open source news.
OBSERVE -> Once the latest news is retreived, send it back to the model to reason about.

Building it this way helps us to avoid this problem where we stuff all the context we need the model to be aware about the system prompt and make our request cause too many tokens.

#### Defining Functions

Functions are declared in the **tools** parameter of each API request.
You declare them as objects with the following keys.

Here we are declaring **tools** in the `responses` api followed by `type`, `name` and `description`

> type -> This should always be function.
> name -> The function's name (e.g get_open_source_news)
> description -> A string that describes what the function does and when to use it.

Define Tools and pass in the model's call

e.g Turn 1

```
const systemPrompt = `You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software.

Use the get_open_source_news tool before recommending software in case recent news would change your answer.
`;

const userPrompt = "I want to replace Calendly for our team. We need SSO authentication and source code access.";
```

Defining tools in **responses** api followed by `type`, `name` and `description`

```
const tools = [
  {
    type: "function",
    name: "get_open_source_news",
    description: "Retrieves recent news about open source software. Use this before recommending software."
  }
]

async function runAgent() {
  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: systemPrompt,
    input: userPrompt,
    tools
  });

  // Inspect what came back
  console.log("\nOutput text:", response.output_text);
  console.log("\nFull output array:", JSON.stringify(response.output, null, 2));
}
```

Output:

```
Output text:

Full output array: [
  {
    "id": "fc_06480a230e4847b1006a4ee2e58bc48191911e51e60abd4830",
    "type": "function_call",
    "status": "completed",
    "arguments": "{}",
    "call_id": "call_hq2k0ZQSjEnZrgvjUK6tnF8I",
    "name": "get_open_source_news"
  }
]
```

### How AI Conversation History Works?xx`

The function call is the model saying, hey app, I need you to run this tool before I answer. So on the next turn the input has to include the function calls associated output.

In input we have earlier we System Prompt > user message
Now after accumulating tool calling System Prompt > tool description > user message.

Turn 1: In turn 1, the input includes tool description as well and final output is not shown to the user because it is not a final answer yet. It is request for a function to be called.

> Input: System Prompt > tool description > user message.
> Output: function_call 1 (not shown to user and passed to turn 2)

Turn 2: In turn 2, input hast to include that function call 1 with associated output 1, this is result for tool calling just requested.

> Input: System Prompt > tool description > user message > function_call 1 > function_call_output 1
> Output: function_call 2 (not shown to user)

Turn 3: model keeps requesting tools, and our app keeps giving output until the model is finally ready to respond.
Input: System Prompt > tool description > user message > function_call 1 > function_call_output 1 > function_call 2 > function_call_output 2
Output: assistant message 1

This is the result for the tool call that you just requested and model could keep requesting tools, and our app could keep giving outputs until the model is finally ready to respond.

We will keep building Agent Loop that can handle functions calls and produce a final response.

#### The Agent Loop (Simplified)

> Context ➡️ Send Request ➡️ Tool Call Required ➡️ No ➡️ Responsd to User

                                  ⬇️
                                  Yes
                                  ⬇️
                                  Add Tool Result
                                  ⬇️
                                  Context

```
const systemPrompt = `You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software.

Use the get_open_source_news tool before recommending software in case recent news would change your answer.`;

const tools = [
  {
    type: "function",
    name: "get_open_source_news",
    description:
      "Retrieve recent news about open-source software. Use this before recommending software, in case recent news would change your answer.",
  },
];

const userPrompt =
  "I want to replace Calendly for our team. We need SSO authentication and source code access.";

async function getOpenSourceNews() {
  const rawNews = await readFile(
    new URL("./news.json", import.meta.url),
    "utf8",
  );
  return JSON.parse(rawNews);
}

async function runAgent() {
  // Keep a running input context array so later turns can see earlier output.
  const inputContext = [{ role: "user", content: userPrompt }];
  const maxTurns = 1;

  let turnCount = 0;

  while (turnCount < maxTurns) {
    turnCount++;
    console.log(`Turn ${turnCount}`);

    const turnResponse = await openai.responses.create({
      model: process.env.AI_MODEL,
      instructions: systemPrompt,
      input: inputContext,
      tools,
    });

    const latestOutputItem = turnResponse.output.at(-1);

    if (latestOutputItem?.type === "message") {
      console.log(
        turnResponse.output_text || "Something went wrong. Please try again.",
      );
      return;
    }

    if (latestOutputItem?.type === "function_call") {
      console.log("Tool call requested:", latestOutputItem.name);

      if (latestOutputItem.name === "get_open_source_news") {
        const openSourceNews = await getOpenSourceNews();
        console.log(openSourceNews);
        console.log(
          `get_open_source_news returned ${openSourceNews.length} items`,
        );
      }
      continue;
    }
  }

  console.log("\nMax turns reached before the model returned a final answer.");
}

// Run the agent when the frontend calls this backend route.
app.post("/api/agent", async (_req, res) => {
  try {
    await runAgent();
    res.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
  }
});
```

### Returning Tool Result

The model has requested a tool and our app can run it. But the next model turn still needs the request and its result.

1. Push the original function_call into inputContext.
2. Push a function_call_output object into inputContext with:
   - type: "function_call_output"
   - call_id: the same call_id from latestOutputItem
   - output: the result as a JSON string with JSON.stringify

Shape of a function_call_output:

- A tool result back to the Responses API is an object that connects the output back to the original request using these keys:

> type: `function_call_output`
> call_id: Connects the result to the exact `function_call` the model made.
> output: The actual data returned by the local function must a `string`

### Tool Parameters

- Imagine if we have very long json and if we sent it every time to AI model, it will be wastage of tokens.
- Instead we could search the news filtering based on some topic. This makes our Agent to Think -> Act -> Observe.
- With Model `function_call` we will also pass `arguments` object attached and we will use those arguments as input parameters to send to your local function.
  e.g `arguments {
  topic: "..."
}`

Here is an example function definition for a get_weather function

```js
{
  "type": "function",
  "name": "get_weather",
  "description": "Retrieves current weather for the given location.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City and country e.g. Bogotá, Colombia"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Units the temperature will be returned in."
      }
    },
    "required": ["location", "units"],
    "additionalProperties": false
  },
  "strict": true
}
```

We will also apply same pattern to our News Agent.

Output: This is much better after adding parameters and it has better output because our model has a local tool that it can use.

Turn 1
Tool call requested: get_open_source_news
Call ID: call_jvFRB4dLHjCM7Xi5TVo6WeGZ
Arguments: {"topic":"Calendly"}
get_open_source_news executed: Got 1 items
Turn 2

Here are open-source alternatives to **Calendly** that can meet your needs—especially **SSO authentication** and **source code access**—plus an important caveat from recent news.

## Important caveat: Cal.com vs “open source”

**Cal.com** is the closest “Calendly-style” product to an open-source Calendly replacement, but note the recent change: Cal.com reports moving its **commercial codebase closed source**, while it launched **Cal.diy** as a **MIT-licensed** (source-available) version.  
So if you require _guaranteed full source-code access_ for the production product you’ll use, you’ll want to confirm whether the exact scheduling/workflow features you need (and SSO) are available in **Cal.diy** vs the now-partly closed Cal.com enterprise path.

## Best-fit open-source options

### 1) **Cal.com (verify edition for your SSO + source access requirements)**

- **Why it fits:** Calendly-like booking pages, routing/customization, self-hosting story.
- **SSO:** Cal.com commonly supports SSO patterns, but **you must confirm SAML/OIDC availability in the edition you’re deploying** (since code openness may differ now).
- **Source code:** Depends on whether you’re using the MIT-licensed **Cal.diy** or the (now) commercial codebase path.
- **Action:** If you’re considering this, ask the vendor/admin team (or check the repo/docs you’d deploy) to confirm:
  - “Does the self-hosted build that includes our SSO feature set map to the MIT repo / accessible code?”
  - “Which identity protocol(s) are supported for SSO (SAML vs OIDC), and are they configurable in our version?”

### 2) **Your own “booking + routing” stack (most control; truly open-source)**

If “must have SSO + must have source code access” is strict (legal/security), the most reliable approach is to build a lightweight scheduler using open components:

- **Frontend booking UI:** open-source React alternatives (or your own)
- **Scheduling logic:** open-source appointment scheduling libs/services
- **Scheduling backend:** run your own service (e.g., Node/Python)
- **SSO:** use standard IdPs via **SAML or OIDC** (Keycloak/Authelia/OR your IdP’s SSO integrations)
- **Why this fits:** You retain full source control, can implement exactly what you need, and can integrate SSO using well-supported open standards.
- **Tradeoff:** More engineering work than Cal.com-like tools.

If you tell me your team size and whether you prefer “install & go” vs “build,” I can sketch an architecture.

### 3) **Keycloak + a scheduling app you control (open-source integration path)**

While **Keycloak** isn’t a Calendly clone, it’s excellent for meeting your **SSO** requirement, and it pairs well with any open-source scheduling UI/backend you choose.

- **SSO:** strong, configurable SAML/OIDC
- **Source access:** Keycloak is open source (with your own deployment you control)
- **You still need:** a scheduling app (either Cal.diy if suitable, or a more generic open-source booking UI)

## What I need from you to recommend the single best option

1. **Do you require SAML or OIDC?** (or “either is fine”)
2. Which IdP do you use? (Okta, Azure AD/Entra, Google Workspace, Auth0, etc.)
3. How strict is “source code access”?
   - “Open-source repo available for the deployed product”
   - or “self-hostable even if some parts are not open”
4. Do you need advanced Calendly features (routing rules, interviewer/pool scheduling, team availability, webhooks/workflows), or just basic booking + SSO?

Reply with those, and I’ll narrow it down to the best candidate (and whether **Cal.diy/Cal.com** meets your exact SSO + source-access requirements).

### Wiring the agent loop

1.  Seed an input context array with the user prompt.
2.  Loop with a turn budget so the agent can never spin forever.
3.  Each turn, call the Responses API with systemPrompt, the input
    context, and tools.
4.  Read the latest output item.
    - If it's a message, return the final text (with a fallback).
    - If it's a function_call: preserve the model's full output turn
      in the context, parse the arguments, and when the tool is
      search_swaps, await searchSwaps(args) and push a
      function_call_output with the matching call_id.
5.  If the loop ever runs out of turns, return a fallback message.
