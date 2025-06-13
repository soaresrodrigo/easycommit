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
    console.log("🔄 Configurações removidas. Será solicitada uma nova chave.");
  }

  let apiKey = getApiKey();
  let apiProvider = getApiProvider();

  if (!apiKey || resetKey) {
    const { provider, apiKey: enteredKey } = await inquirer.prompt([
      {
        type: "list",
        name: "provider",
        message: "Escolha a API de IA:",
        choices: [
          { name: "OpenAI (GPT-4)", value: "openai" },
          { name: "DeepSeek Chat", value: "deepseek" },
        ],
      },
      {
        type: "password",
        name: "apiKey",
        message: (answers) => `Informe sua ${answers.provider} API Key:`,
        mask: "*",
        validate: (input) => !!input || "⚠️ A chave não pode estar vazia!",
      },
    ]);

    apiKey = enteredKey;
    apiProvider = provider;

    if (!saveApiKey(apiKey, provider)) {
      process.exit(1);
    }
    console.log("✅ Configurações salvas com sucesso!");
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
        console.log("👉 Verifique seu saldo em: https://platform.deepseek.com");
      }
      return false;
    }
  }

  if (!(await validateApiKey())) {
    console.log('\n🔧 Dica: Use "--reset-key" para configurar uma nova chave.');
    process.exit(1);
  }

  const diff = execSync("git diff --cached", { encoding: "utf-8" });
  if (!diff.trim()) {
    console.log('⚠️ Nenhuma alteração para commitar. Use "git add" primeiro.');
    return;
  }

  try {
    const prompt = `
      Você é um assistente que gera mensagens de commit claras e concisas.
      - Use um emoji no início (ex: 🐛, ✨, 🔥)
      - Escreva em inglês
      - Inclua prefixos como "feat:", "fix:" quando aplicável

      Contexto adicional: "${userContext}"

      Gere 10 opções baseadas nestas alterações:

      ${diff}

      Apenas liste as mensagens numeradas (1. 2. 3...).
    `;

    const completion = await aiClient.chat.completions.create({
      model: apiProvider === "deepseek" ? "deepseek-chat" : "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const choices = completion.choices[0].message.content
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    const { selected } = await inquirer.prompt([
      {
        type: "list",
        name: "selected",
        message: "Escolha a mensagem de commit:",
        choices,
        pageSize: 5,
      },
    ]);

    console.log(`\n🚀 Commitando: "${selected}"`);
    execSync(`git commit -m "${selected}"`, { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Erro ao gerar commits:", error.message);
    process.exit(1);
  }
})();
