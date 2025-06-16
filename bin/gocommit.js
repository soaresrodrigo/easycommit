#!/usr/bin/env node

import inquirer from "inquirer";
import { execSync } from "child_process";
import OpenAI from "openai";
import {
  saveApiKey,
  getApiKey,
  clearApiKey,
  getApiProvider,
} from "../lib/config.js";

(async () => {
  const args = process.argv.slice(2);
  const resetKey = args.includes("--reset-key");
  const userContext = args.find((arg) => !arg.startsWith("--")) || "";

  if (resetKey) {
    clearApiKey();
    console.log("🔄 Configuration removed. A new key will be requested.");
  }

  let apiKey = getApiKey();
  let apiProvider = getApiProvider();

  if (!apiKey || resetKey) {
    const { provider, apiKey: enteredKey } = await inquirer.prompt([
      {
      type: "list",
      name: "provider",
      message: "Choose the AI API provider:",
      choices: [
        { name: "OpenAI (GPT-4)", value: "openai" },
        { name: "DeepSeek Chat", value: "deepseek" },
      ],
      },
      {
      type: "password",
      name: "apiKey",
      message: (answers) => `Enter your ${answers.provider} API Key:`,
      mask: "*",
      validate: (input) => !!input || "⚠️ The key cannot be empty!",
      },
    ]);

    apiKey = enteredKey;
    apiProvider = provider;

    if (!saveApiKey(apiKey, provider)) {
      process.exit(1);
    }
    console.log("✅ Settings saved successfully!");
  }

  const aiClient = new OpenAI({
    apiKey,
    baseURL:
      apiProvider === "deepseek" ? "https://api.deepseek.com/v1" : undefined,
    timeout: 30000,
  });

  async function validateApiKey() {
    try {
      await aiClient.chat.completions.create({
        model: apiProvider === "deepseek" ? "deepseek-chat" : "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.error(`❌ Erro na API ${apiProvider}:`, error.message);
      if (error.status === 402) {
        console.log("👉 Check your balance at: https://platform.deepseek.com");
      }
      return false;
    }
  }
  console.log('Preparing commit...');
  if (!(await validateApiKey())) {
    console.log('\n🔧 Tip: Use "--reset-key" to set up a new API key.');
    process.exit(1);
  }

  const diff = execSync("git diff --cached", { encoding: "utf-8" });
  if (!diff.trim()) {
    console.log('⚠️ No changes to commit. Use "git add" first.');
    return;
  }

  try {
    const prompt = `
      You are an assistant that generates clear and concise commit messages.
      - Start with an emoji (e.g., 🐛, ✨, 🔥)
      - Write in English
      - Include prefixes like "feat:", "fix:" when applicable

      Additional context: "${userContext}"

      Generate 5 options based on these changes:

      ${diff}

      Only list the numbered messages (1. 2. 3...).
    `;

    const completion = await aiClient.chat.completions.create({
      model: apiProvider === "deepseek" ? "deepseek-chat" : "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    console.clear();

    const choices = completion.choices[0].message.content
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    const { selected } = await inquirer.prompt([
      {
      type: "list",
      name: "selected",
      message: "Choose the commit message:",
      choices,
      pageSize: 5,
      },
    ]);
    
    console.log(`\n🚀 Committing: "${selected}"`);
    execSync(`git commit -m "${selected}"`, { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Error generating commit messages:", error.message);
    process.exit(1);
  }
})();
