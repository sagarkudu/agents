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

type -> This should always be function.
name -> The function's name (e.g get_open_source_news)
description -> A string that describes what the function does and when to use it.

Define Tools and pass in the model's call

e.g Turn 1

```
const systemPrompt = `You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software.

Use the get_open_source_news tool before recommending software in case recent news would change your answer.
`;

const userPrompt = "I want to replace Calendly for our team. We need SSO authentication and source code access.";
```

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

Tools Calls

The function call is the model saying, hey app, I need you to run this tool before I answer. So on the next turn the input has to include the function calls associated output.

In input we have earlier we System Prompt > user message
Now after accumulating tool calling System Prompt > tool description > user message.

Turn 1:
Input: System Prompt > tool description > user message.
Output: function_call 1 (not shown to user)

Turn 2:
Input: System Prompt > tool description > user message > function_call 1 > function_call_output 1
Output: function_call 2 (not shown to user)

Turn 3:
Input: System Prompt > tool description > user message > function_call 1 > function_call_output 1 > function_call 2 > function_call_output 2
Output: assistant message 1

This is the result for the tool call that you just requested and model could keep requesting tools, and our app could keep giving outputs until the model is finally ready to respond.

We will keep building Agent Loop that can handle functions calls and produce a final response.

#### The Agent Loop (Simplified)

Context ➡️ Send Request ➡️ Tool Call Required ➡️ No ➡️ Responsd to User
⬇️
Yes
⬇️
Add Tool Result
⬇️
Context
