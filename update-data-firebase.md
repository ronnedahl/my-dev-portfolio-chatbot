# Peter — Recruiter Q&A for CV Chatbot

Each section is a self-contained chunk meant for RAG ingestion. Questions are phrased the way a recruiter would actually ask them; answers are written in first person as Peter.

---

## Background & Introduction

**Q: Tell me a bit about yourself.**

I'm Peter, a junior developer based in Karlstad, Sweden. Today I work full-time at Jula AB, where I've been for 17 years, while I keep building projects on the side that solve real problems and try to improve my skills every day. For about a year now I've also been helping a company with smaller things like a booking system and work around website ranking and appearance, which gives me a good sense of how things actually work in the real world. Many years ago I worked in TV production as a video editor, but development is where I want to build my future.

**Q: Why did you transition into development?**

I'm a very creative person and at the same time pretty analytical, especially about where things are heading. Web development gives me a way to combine both — I get to build real-world applications and websites that solve actual problems with code. That's what pulled me in. The TV work I did was many years ago, and while I learned a lot from it, building software is what I'm passionate about now and what I want to keep growing in.

**Q: Where are you located and are you open to remote work?**

I'm based in Karlstad in Värmland, Sweden. I'm open to remote, hybrid, or on-site within reasonable distance. I'm comfortable working async through Git and chat tools, and I'm just as happy collaborating in person.

---

## Education

**Q: What's your formal background in development?**

I completed a two-year full-time web development program from 2023 to 2025. The program covered front-end, back-end, databases, deployment, and a thesis project. My thesis was AuraDate (speed-date.online), a React Native video profile dating app with a TikTok-style feed, guided prompts to help users know what to say, and a built-in TV prompter with AI assistance. It was a big project for me and it received top marks.

**Q: How do you keep learning after school?**

Mostly by building things. Every project I take on, I try to include something I haven't done before — a new framework, a new deployment setup, a new tool. I also follow AI developments daily because that space is moving really fast and I don't want to fall behind. I read, I try things, I break things, and then I figure out why.

---

## Tech Stack & Preferences

**Q: What's your main tech stack?**

For web front-end I go with Next.js — it makes most things I want to do easier, and it's my default for anything I plan to deploy. For back-end I like Python with FastAPI; it's quick to set up and works well with anything AI-related. For mobile I prefer native Android with Kotlin and Jetpack Compose. My setup is Windows with WSL2/Ubuntu and VS Code with Remote-WSL, which gives me a Linux-like environment without leaving Windows.

**Q: Why do you prefer Next.js?**

Honestly, for me Next.js just makes things easier. I used to use Vite, but I kept running into CORS issues when connecting to separate back-ends, and that got annoying fast. With Next.js I can put API routes inside the same project, so I avoid that problem, and I also get server-side rendering, file-based routing, and built-in image and font handling out of the box. It's my default now for anything I plan to deploy.

**Q: Why native Android over React Native?**

I built my thesis project in React Native, so I have real experience with both sides. For my next mobile app, Kylskåpskollen, I went with Kotlin and Jetpack Compose because I wanted to learn native Android properly and have direct access to Android features. Compose has been a really nice surprise — it feels a lot like writing React, just in Kotlin.

**Q: What languages are you most comfortable in?**

JavaScript and TypeScript for web, Python for back-end and AI projects, and Kotlin for Android. I've also written PHP for a client project and a bit of Luau for two small Roblox games I made. I try not to be picky about languages — I pick what fits the project.

---

## Projects — ollama-voice-sv

**Q: Tell me about your local voice AI project.**

`ollama-voice-sv` is a local Swedish voice assistant I'm working on. It uses Whisper for speech-to-text, Ollama to run a local LLM, and Piper for text-to-speech. The front-end is Next.js with a green-on-black waveform UI, and the back-end is FastAPI. Everything runs locally, so no data leaves the machine. I've been working on conversation memory, debugging some Chrome microphone issues, and getting the GitHub repo into a state where someone can clone it and quickly understand what it does.

**Q: Why local LLMs instead of an API?**

A few reasons. Cost is more predictable, the user's data stays on their own machine, and the response time can be faster because there's no network round-trip — that matters a lot for a voice conversation to feel natural. There's also a use case I care about: I'd love to see something like this used as a voice companion for elderly people, and in that setting it really matters that the conversation stays private.

---

## Projects — Kylskåpskollen

**Q: What is Kylskåpskollen?**

It's an Android app I'm building in Kotlin with Jetpack Compose to help reduce food waste at home. You track what's in your fridge, get reminders before things expire, and get suggestions for what to use first. It's currently in beta. I also made the demo videos and marketing material myself — short videos for YouTube, a Facebook post, and a LinkedIn post. I recorded the screen with scrcpy and edited in CapCut and OBS.

**Q: Why did you build it?**

Personally, food waste is something I notice in my own household. Professionally, I wanted a portfolio project that proved I could ship a real native Android app, not just a tutorial copy. It also gave me a good reason to dig into Compose and how a real Android app is structured.

---

## Projects — CV Chatbot

**Q: You have a CV chatbot — tell me about it.**

It's a chatbot built with LangGraph and RAG, deployed at cv.peterbot.dev. The idea is that a recruiter can ask questions in natural language and get answers based on my actual background and projects, instead of scrolling through a static PDF. I'm currently refreshing the content because the database is about a year old, and I have a script that handles cleaning and re-ingesting the data so I can iterate on it without doing things manually.

**Q: Why LangGraph instead of a simpler chain?**

For a CV bot you can probably do it with a simpler retrieve-and-generate setup. I picked LangGraph because I wanted to learn how stateful, multi-step agent flows work, so I can use that knowledge in bigger projects later. It also makes it easier to add things like query rewriting or follow-up handling down the line.

---

## Projects — AuraDate / speed-date.online

**Q: Tell me about your thesis project.**

AuraDate is a video profile dating app I built as my thesis in React Native. Instead of static profile pictures, users record short video profiles, and the feed loads them TikTok-style with vertical scroll and autoplay — the video pattern people are used to today. To help users actually know what to say in front of the camera, I built in guided questions and a TV prompter that uses AI to assist. The TV prompter is a fun connection to my older media background — I've worked with real TV prompters in TV production, so building a software version into a dating app felt natural. The project received top marks.

---

## Projects — Roblox Games

**Q: Have you worked with Roblox?**

A bit, yes. I've been building a small racing project called Beat Me Racing as a test project for myself — I want to see how far I can push the Rojo + Claude Code workflow and how much of the development loop I can automate while still keeping the code clean and well-structured. I use Git worktrees so I can try ideas in parallel branches. I also have an earlier card game prototype called Hjärtjakt (Heart Hunt) from when I was learning the basics. Neither is shipped — they're learning projects, not products. Roblox uses Luau, which is a typed version of Lua, and it was a fun change from my normal stack.

---

## Projects — Booking System for Handikappföreningarna Karlstad

**Q: Tell me about your client project for the disability organization.**

I built a booking system for Handikappföreningarna Karlstad, a local disability federation. The back-end is PHP and MySQL on one.com hosting, and the front-end is React with Vite and TypeScript. Working with a non-technical client on a real booking flow taught me a lot — about scope, about accessibility (which really mattered here), and about deploying into a hosting environment I didn't get to choose.

---

## Projects — SimpleSeniorFitness.com

**Q: What's SimpleSeniorFitness?**

It's a content site I'm building around Japanese wellness methods for seniors — things like seiza, makko-ho, hara breathing, radio taiso, Do-In, Sotai, and Kinhin. It's built with Astro and deployed to my Hetzner server, with proper SEO from the start (canonical URLs, sitemaps, structured data). The goal is organic traffic and an affiliate revenue stream over time. It's a slower kind of project than my code projects, and I like the contrast.

---

## DevOps & Infrastructure

**Q: How comfortable are you with deployment and servers?**

Pretty comfortable for a junior. I run several projects on a Hetzner VPS under peterbot.dev and subdomains, using nginx as a reverse proxy, PM2 for Node processes, and Certbot for TLS. I once had to recover the server from a real cryptomining attack, which forced me to actually learn UFW, SSH hardening, and fail2ban properly. That was stressful but probably one of the most useful learning experiences I've had.

**Q: What's your CI/CD experience like?**

I've used GitHub Actions for build and deploy pipelines, and PM2 with nginx on the runtime side. For my own projects I keep things simple — push to main, deploy if the build is green — and I'd add complexity if a project really needs it.

---

## AI/ML Experience

**Q: What's your AI/ML experience?**

It's applied, hands-on, and current. I've built RAG pipelines (the CV chatbot is the main one), worked with LangChain and LangGraph for orchestration, and run local LLMs through Ollama. I've integrated Whisper for speech-to-text and Piper for text-to-speech in a real voice loop. I'm not an ML researcher — I'm someone who's still learning, but who can take AI features and actually ship them in working products. I also use Claude Code as a working partner across most of my projects.

**Q: Have you worked with vector databases?**

Yes, mostly through RAG. I've used vector stores to back retrieval for the CV chatbot and a couple of smaller experiments. I've played around with chunking strategies and learned that the quality of retrieval matters a lot — sometimes more than which model you use.

---

## Side Work & Real-World Experience

**Q: Tell me about the freelance side of your work.**

For about a year now I've been helping a company with smaller things like a booking system and work around their website ranking and appearance. It's not huge in scope, but it's been a really good way to learn how the real world actually works — clients have priorities you didn't expect, deadlines move, and you have to communicate clearly with people who aren't developers. I've also done some SEO-related work using GA4 and Search Console, fixing tracking issues and improving how pages perform.

---

## Soft Skills & Working Style

**Q: How do you work in a team?**

I try to communicate clearly, especially in writing — good PR descriptions, README files that explain why something exists, not just what it does. I'm comfortable getting code review in both directions and I try not to take it personally. Coming from a non-developer background also means I've had a lot of practice talking to people who don't speak tech, which I think helps in cross-functional teams.

**Q: How do you handle being stuck on a problem?**

I try to break it down. First, can I reproduce it in the smallest possible setup. Then I check my assumptions — is the input what I think it is, the version what I think it is, the network doing what I think it is. If I'm still stuck after a while, I ask for help, and I try to write the question clearly, because half the time writing it out makes me see the answer. I use AI tools as part of the process, but I don't ship code I can't explain.

**Q: What's a mistake you've made and what did you learn?**

The cryptomining attack on my Hetzner server is the most honest one. I had set things up with reasonable but not very strict security, and a misconfigured service got compromised. I learned what proper baseline hardening actually looks like — UFW, SSH key-only auth, fail2ban, no public Docker daemons, watching CPU as an early warning. Now I treat server setup as a real task, not something I copy from a tutorial.

---

## Current Situation & Logistics

**Q: Are you currently employed?**

Yes, I work full-time at Jula AB and have been there for 17 years. I do freelance and personal projects on the side and bill those through a third-party invoicing company. I'm open to talking about new opportunities in development where the role and the team feel like a good fit.

**Q: What kind of role are you looking for?**

A junior developer role where I can ship real product code in a modern stack, ideally with some exposure to AI or mobile, and where there's room to grow. I recently applied for a Mobile App Developer (Android) role at Infobric Group, which is a good shape of role for me — native Android, real product, real users.

**Q: Where do you see yourself in a few years?**

Somewhere I'm a confident developer who's trusted with real ownership of features, working on a product that real people use. I don't know yet whether I'd lean more toward IC work or eventually toward a lead track — right now I just want to keep building, keep learning, and stay close to the product and the users.

---

## Why Peter

**Q: Why should we hire you as a junior developer?**

I ship. My GitHub isn't a graveyard of half-finished tutorials — it's projects that are deployed, used, and that I keep maintaining, across web, mobile, AI, and infrastructure. I'm coming into development as a serious career change, so I bring real working-life experience: 17 years at the same company, client communication, deadlines, and the discipline to actually finish things. I know I'm still early in my development career, but I'm motivated, I learn fast, and I genuinely love this work.

**Q: What's something about you that isn't on your CV?**

I'm very creative and at the same time analytical about where things are going — that's the combination that pulled me into development in the first place. I also have an older media background that I quietly use all the time. I edit my own demo videos, write my own marketing copy, and present my projects in a way that not every junior developer can. It also means I'm comfortable being the one who explains things to non-developers, which tends to come in handy.