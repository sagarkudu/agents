Keep agent trying until we get the output, but we need to guard by limiting it to say 5 turns. This is agent loop, agent will keep trying to give desired output

We need to pass the original function_call into inputContext with type, call_id, output.


```
// Push the original function_call into inputContext.
        inputContext.push(latestOutputItem)

        // Run the tool locally
        const openSourceNews = await getOpenSourceNews();
        console.log("get_open_source_news executed: Got", openSourceNews.length, "items");

        // Push a function_call_output object into inputContext
        inputContext.push({
          type: "function_call_output",
          call_id: latestOutputItem.call_id,
          output: JSON.stringify(openSourceNews)
        })
```

Output:

Turn 1
Tool call requested: get_open_source_news
Call ID: call_cBpQvc1UtXdCeBT0GAtnhQkC
get_open_source_news executed: Got 120 items
Turn 2

For replacing **Calendly** with an **open-source** option that provides **SSO authentication** _and_ **source code access**, the short list is basically: **Cal.com (self-hosted/community edition may be limited)** vs **fully self-built scheduling**. Here’s what I can say reliably, and what I’d check next.

## Best-fit OSS option to evaluate: **Cal.com**

- **Why it matches:** Cal.com is the closest OSS scheduling product to Calendly and is designed to be self-hosted.
- **SSO:** Cal.com’s enterprise SAML/SSO capabilities may not be available in every license/edition. Recent news suggests **Cal.com’s core codebase moved between open and closed/editioned parts**, so **you’ll need to verify exactly which SSO methods work in the version you’d deploy**.
- **Source code access:** You’ll need to confirm whether the specific deployment/license you plan includes **full source availability** for the parts that implement auth/SSO.

**Action:** tell me whether you require **SAML 2.0** (common for Okta/Azure AD) or **OIDC** (Auth0/Keycloak/etc.), and whether **GitHub/paid enterprise repo access** counts as “source code access” for your requirement.

## If “source code access + SSO” must be absolute: consider a building-block approach

If your requirement means:

- you can audit _everything_,
- and SSO is handled by a component you control (e.g., Keycloak),
  then the safest open-source architecture is:

1. **Keycloak** for SSO (open source)
2. An OSS scheduling UI/backend
   - either an OSS scheduling app, or
   - a custom app that talks to your calendar provider (e.g., Google/M365/CalDAV)

This tends to be the approach when a Calendly-like app doesn’t fully expose SSO features in its OSS build.

## Other OSS scheduling projects

There are a few open-source meeting/scheduling alternatives, but **they often fall short on one of your two hard constraints**:

- either SSO is limited,
- or source code isn’t fully available / is partly proprietary,
- or they’re more “booking pages” than full Calendly replacement.

Because your requirements are strict, I don’t want to guess and steer you wrong.

---

## Quick questions (so I can recommend the right specific stack)

1. What SSO do you need: **SAML** or **OIDC** (or both)?
2. Which IdP: **Okta / Azure AD / Google Workspace / Keycloak / other**?
3. What does “source code access” mean for you:
   - public repo is enough, or
   - you need guaranteed full source for the auth + scheduling components you run?
4. Do you need **round-robin / routing**, **team event types**, **reminders**, **payment/no-payment**, **video links**, etc.?

Answer those and I’ll narrow it to 1–2 best options and (if needed) a concrete self-hosted design that satisfies both **SSO** and **full source control**.
