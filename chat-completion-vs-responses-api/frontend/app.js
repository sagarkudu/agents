const API_BASE_URL = "http://localhost:3001/api";

const promptInput = document.getElementById("prompt");
const result = document.getElementById("result");
const error = document.getElementById("error");
const health = document.getElementById("health");
const chatButton = document.getElementById("run-chat-completions");
const responsesButton = document.getElementById("run-responses");
const clearButton = document.getElementById("clear");

async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error("Backend is not responding");
    const data = await response.json();
    health.textContent = `● Backend connected · ${data.model}`;
    health.classList.add("online");
  } catch {
    health.textContent = "● Backend offline";
    health.classList.remove("online");
  }
}

async function callApi(endpoint) {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    error.textContent = "Please enter a prompt.";
    return;
  }

  setLoading(true);
  error.textContent = "";
  result.textContent = "Thinking...";

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "ok") {
      throw new Error(data.message || "Request failed.");
    }

    result.textContent =
      endpoint === "responses"
        ? data.result.text
        : data.result;
  } catch (err) {
    result.textContent = "No response.";
    error.textContent = err.message;
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  chatButton.disabled = loading;
  responsesButton.disabled = loading;
}

chatButton.addEventListener("click", () => callApi("chat-completions"));
responsesButton.addEventListener("click", () => callApi("responses"));
clearButton.addEventListener("click", () => {
  result.textContent = "Your AI response will appear here.";
  error.textContent = "";
});

checkBackend();
