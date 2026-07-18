#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const targetDir = process.argv[2] ?? "axicharts-dashboard";

const files = {
  "package.json": JSON.stringify(
    {
      name: path.basename(targetDir),
      private: true,
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        "@axicharts/charts": "latest",
        "@axicharts/charts-theme": "latest",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        uplot: "^1.6.31",
        echarts: "^5.6.0",
      },
      devDependencies: {
        "@types/react": "^19.0.10",
        "@types/react-dom": "^19.0.4",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.8.2",
        vite: "^6.2.0",
      },
    },
    null,
    2,
  ),
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AxiCharts Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`,
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
      },
      include: ["src"],
    },
    null,
    2,
  ),
  "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
  "src/App.tsx": `import { ChartContainer, LineChart } from "@axicharts/charts/cartesian";
import { cleanTheme } from "@axicharts/charts-theme";

export function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>My dashboard</h1>
      <ChartContainer theme={cleanTheme} mode="static" height={220} width={640}>
        <LineChart
          categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
          series={[{ name: "p95 latency", data: [42, 38, 55, 49, 62] }]}
          fill
        />
      </ChartContainer>
    </main>
  );
}
`,
  "README.md": `# ${path.basename(targetDir)}

Scaffolded with \`pnpm create:dashboard\`.

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
`,
};

await mkdir(path.resolve(targetDir), { recursive: true });
await mkdir(path.resolve(targetDir, "src"), { recursive: true });

for (const [file, content] of Object.entries(files)) {
  const filePath = path.join(targetDir, file);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}

console.log(`Created ${targetDir}`);
console.log("Next:");
console.log(`  cd ${targetDir}`);
console.log("  pnpm install");
console.log("  pnpm dev");
