import fs from "node:fs";
import { parse as parseYaml } from "yaml";
import Ajv2020 from "ajv/dist/2020.js";

const cv = parseYaml(fs.readFileSync("cv.yaml", "utf8"));
const schema = JSON.parse(fs.readFileSync("schema.json", "utf8"));
const theme = JSON.parse(fs.readFileSync("theme.json", "utf8"));

function validate(data) {
  const ajv = new Ajv2020({ allErrors: true });
  const check = ajv.compile(schema);
  if (!check(data)) {
    const details = check.errors
      .map((error) => `  ${error.instancePath || "/"} ${error.message}`)
      .join("\n");
    throw new Error(`cv.yaml failed schema validation:\n${details}`);
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markdownLink(contact) {
  return `[${contact.label}](${contact.url})`;
}

function renderMarkdown(data) {
  const lines = [
    `# ${data.name}`,
    "",
    `${data.location} | ${data.contacts.map(markdownLink).join(" | ")}`,
    "",
    `_${data.summary}_`,
    "",
    "## Experience",
    ""
  ];

  data.experience.forEach((entry) => {
    lines.push(`### ${entry.role} - ${entry.organization} (${entry.period})`, "");
    entry.highlights.forEach((highlight) => {
      const label = highlight.label ? `**${highlight.label}** - ` : "";
      lines.push(`- ${label}${highlight.text}`);
    });
    lines.push("");
  });

  lines.push("## Education", "");
  data.education.forEach((entry) => {
    lines.push(`### ${entry.degree} - ${entry.organization} (${entry.period})`, "");
    entry.highlights.forEach((highlight) => lines.push(`- ${highlight}`));
    lines.push("");
  });

  lines.push("## Technical", "");
  data.technical.forEach((group) => {
    lines.push(`- **${group.label}:** ${group.items.join(", ")}`);
  });

  lines.push("", "## Associations", "");
  data.associations.forEach((association) => lines.push(`- ${association}`));
  lines.push("");

  return lines.join("\n");
}

function rootVariables(tokens) {
  const declarations = Object.entries(tokens)
    .map(([name, value]) => `      --${name}: ${value};`)
    .join("\n");
  return `:root {\n${declarations}\n    }`;
}

function renderHtml(data) {
  const styles = fs.readFileSync("src/style.css", "utf8");

  const contacts = data.contacts
    .map((contact) => `<a href="${escapeHtml(contact.url)}">${escapeHtml(contact.label)}</a>`)
    .join("<span aria-hidden=\"true\">/</span>");

  const experience = data.experience.map((entry) => `
      <article class="entry">
        <header>
          <h3>${escapeHtml(entry.role)}</h3>
          <p>${escapeHtml(entry.organization)} <span>${escapeHtml(entry.period)}</span></p>
        </header>
        <ul>
          ${entry.highlights.map((highlight) => {
            const label = highlight.label ? `<strong>${escapeHtml(highlight.label)}</strong> ` : "";
            return `<li>${label}${escapeHtml(highlight.text)}</li>`;
          }).join("\n          ")}
        </ul>
      </article>`).join("\n");

  const education = data.education.map((entry) => `
      <article class="entry">
        <header>
          <h3>${escapeHtml(entry.degree)}</h3>
          <p>${escapeHtml(entry.organization)} <span>${escapeHtml(entry.period)}</span></p>
        </header>
        <ul>
          ${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("\n          ")}
        </ul>
      </article>`).join("\n");

  const technical = data.technical
    .map((group) => `<li><strong>${escapeHtml(group.label)}</strong>${escapeHtml(group.items.join(", "))}</li>`)
    .join("\n          ");

  const associations = data.associations.map((association) => `<li>${escapeHtml(association)}</li>`).join("\n          ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.name)} - CV</title>
  <style>
    ${rootVariables(theme)}

${styles}
  </style>
</head>
<body>
  <main>
    <header class="masthead">
      <h1>${escapeHtml(data.name)}</h1>
      <p class="contact"><span>${escapeHtml(data.location)}</span><span aria-hidden="true">/</span>${contacts}</p>
      <p class="summary">${escapeHtml(data.summary)}</p>
    </header>

    <section>
      <h2>Experience</h2>
      <div>${experience}</div>
    </section>

    <section>
      <h2>Education</h2>
      <div>${education}</div>
    </section>

    <section>
      <h2>Technical</h2>
      <ul class="technical">
        ${technical}
      </ul>
    </section>

    <section>
      <h2>Associations</h2>
      <ul>
        ${associations}
      </ul>
    </section>
  </main>
</body>
</html>
`;
}

function renderText(data) {
  return renderMarkdown(data)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/_/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/^- /gm, "  - ");
}

validate(cv);

fs.writeFileSync("cv.md", renderMarkdown(cv));
fs.writeFileSync("cv.html", renderHtml(cv));
fs.writeFileSync("cv.txt", renderText(cv));
