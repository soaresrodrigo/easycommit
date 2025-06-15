import fs from 'fs';
import path from 'path';
import os from 'os';

const configPath = path.join(os.homedir(), '.gocommit.json');

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (error) {
    console.error('❌ Error reading configuration:', error.message);
  }
  return null;
}

export function saveApiKey(apiKey, provider = 'openai') {
  try {
    fs.writeFileSync(configPath, JSON.stringify({ apiKey, provider }, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error saving API Key:', error.message);
    return false;
  }
}

export function getApiKey() {
  const config = loadConfig();
  return config?.apiKey || null;
}

export function getApiProvider() {
  const config = loadConfig();
  return config?.provider || 'openai';
}

export function clearApiKey() {
  try {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      return true;
    }
  } catch (error) {
    console.error('❌ Error removing API Key:', error.message);
  }
  return false;
}