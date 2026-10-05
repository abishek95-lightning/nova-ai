# Nova AI — Real AI Backend

This backend connects the existing Nova AI frontend to the OpenAI Responses API.

## 1. Install Node.js

Use a current LTS version of Node.js.

## 2. Put the frontend in `public/`

Create this folder:

```text
nova-ai-backend/
  public/
    index.html
```

Copy the current Nova AI prototype's `index.html` into `public/index.html`.

The current frontend already calls:

```text
POST /api/chat
```

so no API key belongs in the browser.

## 3. Configure the API key

Copy `.env.example` to `.env` and put your own API key in it:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5
PORT=3000
```

Never commit `.env` to GitHub or put the API key inside `index.html`.

## 4. Install and run

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

It should report `ok: true` and `aiConfigured: true`.

## How it works

```text
Nova AI browser UI
       |
       | POST /api/chat
       v
Node.js + Express server
       |
       | OpenAI Responses API
       v
AI model
       |
       v
Real answer -> browser
```

The server keeps the API key private and sends the conversation history plus Nova's personality instructions to the model.

## Deployment

This project is designed for a Node-compatible hosting service. Set these environment variables in the host's dashboard:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional; defaults to `gpt-5`)
- `NODE_ENV=production`

Use the host's generated HTTPS URL as your public Nova AI URL.

For a production app, also add authentication, rate limiting, usage limits, and logging controls before opening it to the public.
