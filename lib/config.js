import fs from 'fs';
import path from 'path';
import os from 'os';

const configPath = path.join(os.homedir(), '.easycommit.json');

// Carrega as configurações existentes
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (error) {
    console.error('❌ Erro ao ler configurações:', error.message);
  }
  return null;
}

// Salva chave e provider (OpenAI/DeepSeek)
export function saveApiKey(apiKey, provider = 'openai') {
  try {
    fs.writeFileSync(configPath, JSON.stringify({ apiKey, provider }, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar API Key:', error.message);
    return false;
  }
}

// Obtém a API Key salva
export function getApiKey() {
  const config = loadConfig();
  return config?.apiKey || null;
}

// Obtém o provider salvo (openai/deepseek)
export function getApiProvider() {
  const config = loadConfig();
  return config?.provider || 'openai'; // Padrão: OpenAI
}

// Remove as configurações
export function clearApiKey() {
  try {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao remover API Key:', error.message);
  }
  return false;
}