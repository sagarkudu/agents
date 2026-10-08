  // Click the button to trigger the server-side agent and watch the console for output.
  const runAgentButton = document.getElementById("run-agent-button");

  runAgentButton.addEventListener("click", async () => {
    runAgentButton.disabled = true;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/agent`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Agent response:", data);
    } catch (error) {
      console.error("Agent request failed:", error);
    } finally {
      runAgentButton.disabled = false;
    }
  });

