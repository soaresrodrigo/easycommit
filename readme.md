Here's a polished GitHub project description in English for your **GoCommit** tool:

---

# 🔥 GoCommit - AI-Powered Git Commit Message Generator  

**Stop writing boring commit messages!** Let AI generate clear, concise, and expressive Git commits for you – complete with emojis and conventional prefixes. Supports **OpenAI** and **DeepSeek** APIs.  

![Demo GIF](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDF5dWU3b2VtZ3JqY2V6Z2JtY3B6dWJ6Y2RlZzZ1bmZqZ2ZxZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IgG50Fb7Mi0prBC/giphy.gif) *(placeholder for your demo GIF)*  

## ✨ Features  

- **🤖 AI-Generated Messages** – Get 5 perfectly formatted commit suggestions in seconds  
- **🎨 Emoji + Conventional Commits** – `feat: ✨ Add dark mode` instead of "updated stuff"  
- **🔌 Multi-API Support** – Works with both **OpenAI (GPT-4)** and **DeepSeek**  
- **⚡ Git Integration** – Directly commits your selected message  
- **🔐 Secure Storage** – API keys saved locally in `~/.gocommit.json`  

## 🚀 Quick Start  

```bash
npx gocommit  
# or install globally
npm install -g gocommit
```  

1. Choose your AI provider (OpenAI/DeepSeek)  
2. Paste your API key when prompted  
3. Stage changes with `git add`  
4. Run `gocommit` and pick your favorite message!  

## 🌟 Why GoCommit?  

| Traditional Commits          | GoCommit Messages          |
|------------------------------|------------------------------|
| `fix bug`                    | `🐛 fix: login form error`    |
| `update config`              | `⚙️ chore: update eslint config` |
| `add feature`                | `✨ feat: add user dashboard` |

Perfect for developers who want:  
✅ Professional-looking commit history  
✅ Faster workflow (no more commit message writer's block!)  
✅ Team-friendly standardized messages  

## ⚙️ Configuration  

```bash
# Reset API settings
gocommit --reset-key  

# Provide context
gocommit "Refactoring payment module"  
```  

## 📦 Dependencies  
- Node.js 18+  
- Git  

---

### Suggested Repo Tags:  
`git` `commit` `ai` `openai` `deepseek` `productivity` `developer-tools`  
