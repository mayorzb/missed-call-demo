const businessNameInput = document.querySelector("#business-name");
const quoteLinkInput = document.querySelector("#quote-link");
const replyMessageInput = document.querySelector("#reply-message");
const callerNumberInput = document.querySelector("#caller-number");
const simulateButton = document.querySelector("#simulate-button");
const conversation = document.querySelector("#conversation");
const phoneContactNumber = document.querySelector("#phone-contact-number");
const missedCallNumber = document.querySelector("#missed-call-number");
const activityList = document.querySelector("#activity-list");
const activityEmpty = document.querySelector("#activity-empty");
const activityCount = document.querySelector("#activity-count");
const estimateInputs = [
  document.querySelector("#missed-calls"),
  document.querySelector("#reply-rate"),
  document.querySelector("#job-value"),
];

const activity = [];
let currentSimulationId = 0;

function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function buildMessage() {
  const business = businessNameInput.value.trim();
  const link = quoteLinkInput.value.trim();
  const template = replyMessageInput.value;
  const message = template
    .replaceAll("{business}", business)
    .replaceAll("{link}", link);

  return { message, link: safeHttpUrl(link), template, business };
}

function renderMessage(messageData) {
  const parts = messageData.template.split(/(\{link\})/g);
  const bubble = document.createElement("div");
  bubble.className = "text-bubble";

  for (const part of parts) {
    if (part === "{link}") {
      if (messageData.link) {
        const anchor = document.createElement("a");
        anchor.href = messageData.link;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = messageData.link;
        bubble.append(anchor);
      } else {
        bubble.append(document.createTextNode(messageData.linkText));
      }
    } else {
      bubble.append(document.createTextNode(part.replaceAll("{business}", messageData.business)));
    }
  }

  return bubble;
}

function updateConversation(number, messageData, showMessage) {
  phoneContactNumber.textContent = number || "Unknown caller";
  missedCallNumber.textContent = number || "Unknown caller";

  const date = document.createElement("div");
  date.className = "conversation-date";
  date.textContent = "TODAY";

  const callCard = document.createElement("div");
  callCard.className = "missed-call-card";
  const icon = document.createElement("span");
  icon.className = "missed-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "↙";
  const callDetails = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = "Missed call";
  const caller = document.createElement("small");
  caller.textContent = number || "Unknown caller";
  callDetails.append(title, caller);
  callCard.append(icon, callDetails);

  conversation.replaceChildren(date, callCard);
  if (showMessage) {
    conversation.append(renderMessage(messageData));
  } else {
    const pending = document.createElement("p");
    pending.className = "phone-placeholder";
    pending.textContent = "Sending your text-back…";
    conversation.append(pending);
  }
}

function renderActivity() {
  activityList.replaceChildren();
  activityEmpty.hidden = activity.length > 0;
  activityCount.textContent = `${activity.length} / 20`;

  for (const entry of activity) {
    const row = document.createElement("div");
    row.className = "activity-entry";
    const time = document.createElement("span");
    time.className = "activity-time";
    time.textContent = entry.time;
    const details = document.createElement("span");
    details.className = "activity-details";
    const caller = document.createElement("span");
    caller.className = "activity-caller";
    caller.textContent = entry.number || "Unknown caller";
    const status = document.createElement("span");
    status.className = `activity-status${entry.sent ? " sent" : ""}`;
    status.textContent = entry.sent ? "Missed · text sent" : "Missed · sending…";
    details.append(caller, status);
    const check = document.createElement("span");
    check.className = "activity-check";
    check.setAttribute("aria-label", entry.sent ? "Text sent" : "Text sending");
    check.textContent = entry.sent ? "✓" : "…";
    row.append(time, details, check);
    activityList.append(row);
  }
}

function updateEstimate() {
  const [callsInput, replyRateInput, jobValueInput] = estimateInputs;
  const calls = Math.max(0, Number(callsInput.value) || 0);
  const replyRate = Math.min(100, Math.max(0, Number(replyRateInput.value) || 0));
  const jobValue = Math.max(0, Number(jobValueInput.value) || 0);
  const monthlyValue = calls * (replyRate / 100) * jobValue * 4.33;
  document.querySelector("#monthly-estimate").textContent = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(monthlyValue);
}

function simulateMissedCall() {
  const number = callerNumberInput.value.trim();
  const messageData = buildMessage();
  messageData.linkText = quoteLinkInput.value.trim();
  const entry = {
    id: ++currentSimulationId,
    number,
    time: new Intl.DateTimeFormat("en-IE", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    sent: false,
  };

  activity.unshift(entry);
  activity.splice(20);
  updateConversation(number, messageData, false);
  renderActivity();
  simulateButton.disabled = true;
  simulateButton.setAttribute("aria-busy", "true");

  window.setTimeout(() => {
    entry.sent = true;
    renderActivity();
    if (entry.id === currentSimulationId) {
      updateConversation(number, messageData, true);
      simulateButton.disabled = false;
      simulateButton.removeAttribute("aria-busy");
    }
  }, 2000);
}

simulateButton.addEventListener("click", simulateMissedCall);
estimateInputs.forEach((input) => input.addEventListener("input", updateEstimate));
updateEstimate();
