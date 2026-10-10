- Here we do not require keep `type: 'reasoning'` and just preserve all output items for the next turn `inputContext.push(latestOutputItem)`. We need to add every output item to the input context for the next turn.

This will add every single output item of the turnResponse to the next turn's input context

```
const turnResponse = await openai.responses.create({
  model: process.env.AI_MODEL,
  instructions: systemPrompt,
  input: inputContext,
  tools,
});

// Push the original function_call into inputContext.
inputContext.push(...turnResponse.output);
```

- Here we can expect final answer and also expect reasoning item in output array:

Turn 1
Tool call requested: get_open_source_news
Call ID: call_PdSPzokJNVRDODWREppCTPZk
get_open_source_news executed: Got 120 items
Turn 2

For replacing **Calendly** with **SSO authentication** _and_ **source code access**, there aren’t many true “Calendly-like” options that are both **open-source and SSO-capable out of the box**.

That said, here are the best open-source directions, depending on how strict your “source code access” requirement is.

## Option A (closest to Calendly UX): **Cal.com (open-source fork / edition split risk)**

- **Why it might fit:** Cal.com is a scheduling product in the same family as Calendly (event types, booking links, routing).
- **SSO:** The enterprise/SAML+SSO feature set may depend on the commercial offering; verify your exact SSO needs (SAML vs OIDC, IdP type).
- **Source code:** Recent news indicates Cal.com has had an open-source “diy/edition” split, so you should confirm whether the edition you’d deploy includes the SSO/auth layer you need.
- **When to choose:** If you want Calendly-like scheduling with the smallest workflow change, and you’re able to validate the SSO/auth implementation you require.

## Option B (most reliable for your requirements): **Self-hosted scheduling built on OSS + SSO**

If SSO is non-negotiable and you truly need the ability to inspect/modify the whole auth flow, the safer approach is:

1. pick an OSS app that already has **SSO (OIDC/SAML)** support, and
2. add/enable scheduling features (either via an OSS scheduling module/app, or by integrating a lightweight calendar/booking component).

### Common building blocks (all typically have OSS + SSO paths)

- **Identity provider (IdP):** Keycloak (OIDC/SAML), authentik, or FusionAuth (community/open parts vary).
- **App layer:** an open web app you can extend (e.g., a Django/Rails/Node app) or an OSS “bookings” module.
- **SSO:** handled centrally by the IdP, so you’re not dependent on a scheduling product’s proprietary auth.

**When to choose:** If your priority is “we can own/inspect the auth and everything relevant,” even if it means more implementation effort than a drop-in replacement.

## Option C (calendar routing without full “booking SaaS”): **Mattermost/Nextcloud ecosystem + custom booking**

Some teams replace Calendly with:

- “request booking” forms in an OSS workflow tool
- calendar event creation + confirmation
- SSO via the same IdP across the stack

This can be implemented with OSS components, but it’s not as polished as Calendly unless you invest some integration time.

---

## Quick questions so I can recommend a specific shortlist

1. What SSO protocol do you need: **SAML** or **OIDC** (or both)?
2. Do you need SSO for **meeting attendees** (external users booking) as well, or only for **internal staff** managing bookings?
3. What’s your preferred hosting: **on-prem**, **Kubernetes**, or **either**?
4. By “source code access,” do you mean:
   - (a) the whole scheduling/auth system is open source, or
   - (b) it’s enough if you can self-host open components and the closed parts don’t affect SSO?

Reply with those and I’ll give you 2–3 concrete recommendations (including which ones are likely to satisfy SSO + code access, and what to verify during evaluation).

Note: In turn 2 we again get reasoning but this time with the `type: 'message'` with the results which again uses knowledge of `cal.com` going closed source.
This was the small code change but it made our agent loop much stronger.

