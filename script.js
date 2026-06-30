const lines = [
  "booting agentropolis://mcp-kit",
  "loading Hermes router... online",
  "loading NemoClaw builder layer... online",
  "loading Nemotron research council... online",
  "scanning MCP registry... candidate tools detected",
  "wallet execution locked behind policy guardrails",
  "status: build the city before you unleash the agents"
];

const terminal = document.getElementById("terminalText");
let lineIndex = 0;
let charIndex = 0;

function typeTerminal() {
  if (!terminal) return;
  if (lineIndex >= lines.length) return;
  const current = lines[lineIndex];
  terminal.textContent += current[charIndex] || "";
  charIndex++;
  if (charIndex > current.length) {
    terminal.textContent += "\n";
    lineIndex++;
    charIndex = 0;
    setTimeout(typeTerminal, 320);
  } else {
    setTimeout(typeTerminal, 28);
  }
}

typeTerminal();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.18 });

document.querySelectorAll(".card, .agent-card").forEach((el) => observer.observe(el));
