When you just write **tools** in responses api,
The below output is strange, the model just answered with a normal message without even taking our tool into account.
Note: Defining a tool doesn't mean the model automatically going to use it, here `system prompt` and `description` does not tell AI to use the `tool`.
The tool is already defined and passed to the model, but the model is ignoring it. The words the model reads are what make it use a tool.

Old:

````const tools = [
  {
    type: "function",
    name: "get_open_source_news",
    description: "Retrieves recent news about open source software.",
  },
];```

```async function runAgent() {
  const response = await openai.responses.create({
    model: process.env.AI_MODEL,
    instructions: systemPrompt,
    input: userPrompt,
    tools,
  });

  // Inspect what came back
  console.log("\nOutput text:", response.output_text);
  console.log("\nFull output array:", JSON.stringify(response.output, null, 2));
}```
````

Ouput:
Output text: Got it. For replacing **Calendly**, you’ll want something like an appointment scheduler with:

- **SSO authentication** (typically SAML and/or OIDC via your IdP)
- **Open-source code access** (either self-hostable open-source, or an open-core project)

Here are the best-fit open-source options to evaluate:

## Top open-source candidates

### 1) **Free/Busy / Calendar scheduling apps with self-hosted booking + SSO**

Many “scheduling” tools are open-source but vary on SSO. In practice, the most reliable SSO requirement is usually met when the project is designed for self-hosting with OIDC/SAML support (often via a reverse proxy or built-in IdP integration).

**What to look for in any candidate:**

- Built-in **OIDC** or **SAML** login OR clear documentation for SSO via reverse proxy
- User management / “organization” support (not just anonymous scheduling)
- Webhooks / API (for routing bookings, notifications, CRM sync)

If you tell me your IdP, I can narrow it to those that most cleanly support it.

### 2) **Odoo (Calendar + Scheduling) — open-source core**

**Odoo** Community Edition is open-source; enterprise adds more features, but many teams use the community edition plus additional modules.

- **SSO:** commonly supported depending on your deployment/modules (OIDC/SAML integrations exist in the Odoo ecosystem)
- **Code access:** fully open-source for the community edition; enterprise is paid but you still retain access to the community base
- **Pros:** flexible workflows, permissions, user management
- **Cons:** heavier/ERP-like; setup effort is higher than a focused booking tool

### 3) **Nextcloud + “appointment”-style integrations**

Nextcloud is open-source and supports enterprise authentication patterns depending on plugins and your setup.

- **SSO:** often achievable via Nextcloud auth integrations and/or reverse proxy
- **Code access:** yes (Nextcloud is open-source)
- **Pros:** strong identity + file collaboration base
- **Cons:** appointment scheduling may require additional tooling; not always as streamlined as Calendly UX

### 4) **Matrix/Element + scheduling alternatives (less direct)**

Not usually the best fit for “Calendly replacement,” but worth mentioning only if your team wants federated tooling. Most teams choose a true scheduling platform instead.

## Quick questions to recommend the _right_ 1–3 options

1. **What SSO provider** do you use? (Okta, Azure AD/Entra ID, Google Workspace, Keycloak, Auth0, etc.)
2. Do you need **per-user booking links** (like Calendly “events”) or can it be **team-based routing**?
3. Do you require **video meetings** (Zoom/Meet/Teams) to be embedded automatically?
4. Where will you host it? (AWS/VPS/on-prem/Kubernetes)
5. Any must-haves: payment links, routing rules, availability rules, team calendars, interviewer pools, etc.?

If you answer those, I’ll shortlist the best open-source/self-hostable replacements that meet **SSO + source access** with the least friction for your environment.

After updating:

const systemPrompt =
"You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software. **_ Use the get_open_source_news tool before recommending software in case recent news would change your answer. _** ";

const userPrompt =
"I want to replace Calendly for our team. We need SSO authentication and source code access.";

const tools = [
{
type: "function",
name: "get_open_source_news",
description:
"Retrieves recent news about open source software. *** Use this before recommending software. *** ",
},
];

NOte: We only get function call array back. The model is not yet ready to give final answer back. No news has been fetched yet.
Full output array: [
{
"id": "fc_0eaf3f8522b52ccd006ac333841b5087d1888cd63f09492e56",
"type": "function_call",
"status": "completed",
"arguments": "{}",
"call_id": "call_diFK8V81Dru9ucsohH98KEJN",
"name": "get_open_source_news"
}
]
