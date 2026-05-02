"""Populate Firebase vector store with Peter's information."""

import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from src.services.firebase_vector_store import FirebaseVectorStore
import structlog

logger = structlog.get_logger()


async def populate_knowledge_base():
    """Add Peter's information to the vector store."""

    store = FirebaseVectorStore()

    documents = [
        {
            "text": "I'm Peter, a junior developer based in Karlstad, Sweden. Today I work full-time at Jula AB, where I've been for 17 years, while I keep building projects on the side that solve real problems and try to improve my skills every day. For about a year now I've also been helping a company with smaller things like a booking system and work around website ranking and appearance, which gives me a good sense of how things actually work in the real world. Many years ago I worked in TV production as a video editor, but development is where I want to build my future.",
            "metadata": {"category": "background", "topic": "introduction"}
        },
        {
            "text": "I'm a very creative person and at the same time pretty analytical, especially about where things are heading. Web development gives me a way to combine both — I get to build real-world applications and websites that solve actual problems with code. That's what pulled me in. The TV work I did was many years ago, and while I learned a lot from it, building software is what I'm passionate about now and what I want to keep growing in.",
            "metadata": {"category": "background", "topic": "transition_to_development"}
        },
        {
            "text": "I'm based in Karlstad in Värmland, Sweden. I'm open to remote, hybrid, or on-site within reasonable distance. I'm comfortable working async through Git and chat tools, and I'm just as happy collaborating in person.",
            "metadata": {"category": "background", "topic": "location_remote"}
        },
        {
            "text": "I completed a two-year full-time web development program from 2023 to 2025. The program covered front-end, back-end, databases, deployment, and a thesis project. My thesis was AuraDate (speed-date.online), a React Native video profile dating app with a TikTok-style feed, guided prompts to help users know what to say, and a built-in TV prompter with AI assistance. It was a big project for me and it received top marks.",
            "metadata": {"category": "education", "topic": "formal_education"}
        },
        {
            "text": "During my education I did two LIA internships (Lärande i Arbete) at a company that wanted help implementing AI into their business. We built both cloud-based chatbot solutions and local AI solutions, and compared them to figure out which approach was most cost-effective for the company. That gave me hands-on experience experimenting with different AI setups and working with larger datasets, which taught me a lot in a short time. I was lucky to spend both LIA periods focused on AI, which suited me perfectly since I'm deeply interested in AI and use it every day.",
            "metadata": {"category": "education", "topic": "lia_internships"}
        },
        {
            "text": "I keep learning mostly by building things. Every project I take on, I try to include something I haven't done before — a new framework, a new deployment setup, a new tool. I also follow AI developments daily because that space is moving really fast and I don't want to fall behind. I read, I try things, I break things, and then I figure out why.",
            "metadata": {"category": "education", "topic": "continuous_learning"}
        },
        {
            "text": "For web front-end I go with Next.js — it makes most things I want to do easier, and it's my default for anything I plan to deploy. For back-end I like Python with FastAPI; it's quick to set up and works well with anything AI-related. For mobile I prefer native Android with Kotlin and Jetpack Compose. My setup is Windows with WSL2/Ubuntu and VS Code with Remote-WSL, which gives me a Linux-like environment without leaving Windows.",
            "metadata": {"category": "skills", "topic": "tech_stack"}
        },
        {
            "text": "Honestly, for me Next.js just makes things easier. I used to use Vite, but I kept running into CORS issues when connecting to separate back-ends, and that got annoying fast. With Next.js I can put API routes inside the same project, so I avoid that problem, and I also get server-side rendering, file-based routing, and built-in image and font handling out of the box. It's my default now for anything I plan to deploy.",
            "metadata": {"category": "skills", "topic": "nextjs_preference"}
        },
        {
            "text": "I built my thesis project in React Native, so I have real experience with both sides. For my next mobile app, Kylskåpskollen, I went with Kotlin and Jetpack Compose because I wanted to learn native Android properly and have direct access to Android features. Compose has been a really nice surprise — it feels a lot like writing React, just in Kotlin.",
            "metadata": {"category": "skills", "topic": "mobile_development"}
        },
        {
            "text": "I'm most comfortable in JavaScript and TypeScript for web, Python for back-end and AI projects, and Kotlin for Android. I've also written PHP for a client project and a bit of Luau for two small Roblox games I made. I try not to be picky about languages — I pick what fits the project.",
            "metadata": {"category": "skills", "topic": "languages"}
        },
        {
            "text": "ollama-voice-sv is a local Swedish voice assistant I'm working on. It uses Whisper for speech-to-text, Ollama to run a local LLM, and Piper for text-to-speech. The front-end is Next.js with a green-on-black waveform UI, and the back-end is FastAPI. Everything runs locally, so no data leaves the machine. I've been working on conversation memory, debugging some Chrome microphone issues, and getting the GitHub repo into a state where someone can clone it and quickly understand what it does.",
            "metadata": {"category": "projects", "topic": "ollama_voice_sv"}
        },
        {
            "text": "I prefer local LLMs over an API for a few reasons. Cost is more predictable, the user's data stays on their own machine, and the response time can be faster because there's no network round-trip — that matters a lot for a voice conversation to feel natural. There's also a use case I care about: I'd love to see something like this used as a voice companion for elderly people, and in that setting it really matters that the conversation stays private.",
            "metadata": {"category": "projects", "topic": "local_llm_motivation"}
        },
        {
            "text": "Kylskåpskollen is an Android app I'm building in Kotlin with Jetpack Compose to help reduce food waste at home. You track what's in your fridge, get reminders before things expire, and get suggestions for what to use first. It's currently in beta. I also made the demo videos and marketing material myself — short videos for YouTube, a Facebook post, and a LinkedIn post. I recorded the screen with scrcpy and edited in CapCut and OBS.",
            "metadata": {"category": "projects", "topic": "kylskapskollen"}
        },
        {
            "text": "I built Kylskåpskollen because food waste is something I notice in my own household. Professionally, I wanted a portfolio project that proved I could ship a real native Android app, not just a tutorial copy. It also gave me a good reason to dig into Compose and how a real Android app is structured.",
            "metadata": {"category": "projects", "topic": "kylskapskollen_motivation"}
        },
        {
            "text": "My CV chatbot is built with LangGraph and RAG, deployed at cv.peterbot.dev. The idea is that a recruiter can ask questions in natural language and get answers based on my actual background and projects, instead of scrolling through a static PDF. I'm currently refreshing the content because the database is about a year old, and I have a script that handles cleaning and re-ingesting the data so I can iterate on it without doing things manually.",
            "metadata": {"category": "projects", "topic": "cv_chatbot"}
        },
        {
            "text": "For a CV bot you can probably do it with a simpler retrieve-and-generate setup. I picked LangGraph because I wanted to learn how stateful, multi-step agent flows work, so I can use that knowledge in bigger projects later. It also makes it easier to add things like query rewriting or follow-up handling down the line.",
            "metadata": {"category": "projects", "topic": "langgraph_motivation"}
        },
        {
            "text": "AuraDate is a video profile dating app I built as my thesis in React Native. Instead of static profile pictures, users record short video profiles, and the feed loads them TikTok-style with vertical scroll and autoplay — the video pattern people are used to today. To help users actually know what to say in front of the camera, I built in guided questions and a TV prompter that uses AI to assist. The TV prompter is a fun connection to my older media background — I've worked with real TV prompters in TV production, so building a software version into a dating app felt natural. The project received top marks.",
            "metadata": {"category": "projects", "topic": "auradate_thesis"}
        },
        {
            "text": "AuraDate is without a doubt my biggest project. I set the bar very high from the start, which made it a real challenge. It started as my thesis project, but I kept building on it after the program ended, constantly improving the structure as I learned more. I refactored a lot — partly to write cleaner code, but mostly to make the project easier to debug and maintain as it grew. Going back and restructuring something I'd already built taught me more about good architecture than any tutorial could.",
            "metadata": {"category": "projects", "topic": "auradate_journey"}
        },
        {
            "text": "The technical challenges in AuraDate were real. I struggled a lot with Expo Go and with the question of where to compress the videos — backend or frontend. After experimenting I landed on frontend compression, which gave better results for my use case. I also learned a lot about the server my backend runs on, since I needed to handle video uploads at a different scale than a typical web app. Mobile permissions were another big source of debugging — getting the camera, microphone, and storage permissions to behave correctly across devices took real time. There was a lot of trial and error in this project.",
            "metadata": {"category": "projects", "topic": "auradate_technical_challenges"}
        },
        {
            "text": "AuraDate raised my level as a developer. By the time I started building Kylskåpskollen as a native Android app, it felt almost easy in comparison — not because Android is simple, but because I had already pushed through so many harder problems with AuraDate: video, permissions, performance, refactoring at scale. That's part of why I keep going back and improving AuraDate; every iteration teaches me something I take into the next project.",
            "metadata": {"category": "projects", "topic": "auradate_lessons"}
        },
        {
            "text": "I've worked a bit with Roblox. I've been building a small racing project called Beat Me Racing as a test project for myself — I want to see how far I can push the Rojo + Claude Code workflow and how much of the development loop I can automate while still keeping the code clean and well-structured. I use Git worktrees so I can try ideas in parallel branches. I also have an earlier card game prototype called Hjärtjakt (Heart Hunt) from when I was learning the basics. Neither is shipped — they're learning projects, not products. Roblox uses Luau, which is a typed version of Lua, and it was a fun change from my normal stack.",
            "metadata": {"category": "projects", "topic": "roblox_games"}
        },
        {
            "text": "I built a booking system for Handikappföreningarna Karlstad, a local disability federation. The back-end is PHP and MySQL on one.com hosting, and the front-end is React with Vite and TypeScript. Working with a non-technical client on a real booking flow taught me a lot — about scope, about accessibility (which really mattered here), and about deploying into a hosting environment I didn't get to choose.",
            "metadata": {"category": "projects", "topic": "client_booking_system"}
        },
        {
            "text": "SimpleSeniorFitness is a content site I'm building around Japanese wellness methods for seniors — things like seiza, makko-ho, hara breathing, radio taiso, Do-In, Sotai, and Kinhin. It's built with Astro and deployed to my Hetzner server, with proper SEO from the start (canonical URLs, sitemaps, structured data). The goal is organic traffic and an affiliate revenue stream over time. It's a slower kind of project than my code projects, and I like the contrast.",
            "metadata": {"category": "projects", "topic": "simple_senior_fitness"}
        },
        {
            "text": "I'm pretty comfortable with deployment and servers for a junior. I run several projects on a Hetzner VPS under peterbot.dev and subdomains, using nginx as a reverse proxy, PM2 for Node processes, and Certbot for TLS. I once had to recover the server from a real cryptomining attack, which forced me to actually learn UFW, SSH hardening, and fail2ban properly. That was stressful but probably one of the most useful learning experiences I've had.",
            "metadata": {"category": "devops", "topic": "deployment_servers"}
        },
        {
            "text": "I've used GitHub Actions for build and deploy pipelines, and PM2 with nginx on the runtime side. For my own projects I keep things simple — push to main, deploy if the build is green — and I'd add complexity if a project really needs it.",
            "metadata": {"category": "devops", "topic": "ci_cd"}
        },
        {
            "text": "My AI/ML experience is applied, hands-on, and current. I've built RAG pipelines (the CV chatbot is the main one), worked with LangChain and LangGraph for orchestration, and run local LLMs through Ollama. I've integrated Whisper for speech-to-text and Piper for text-to-speech in a real voice loop. I'm not an ML researcher — I'm someone who's still learning, but who can take AI features and actually ship them in working products. I also use Claude Code as a working partner across most of my projects.",
            "metadata": {"category": "ai_ml", "topic": "experience"}
        },
        {
            "text": "Yes, I've worked with vector databases, mostly through RAG. I've used vector stores to back retrieval for the CV chatbot and a couple of smaller experiments. I've played around with chunking strategies and learned that the quality of retrieval matters a lot — sometimes more than which model you use.",
            "metadata": {"category": "ai_ml", "topic": "vector_databases"}
        },
        {
            "text": "For about a year now I've been helping a company with smaller things like a booking system and work around their website ranking and appearance. It's not huge in scope, but it's been a really good way to learn how the real world actually works — clients have priorities you didn't expect, deadlines move, and you have to communicate clearly with people who aren't developers. I've also done some SEO-related work using GA4 and Search Console, fixing tracking issues and improving how pages perform.",
            "metadata": {"category": "experience", "topic": "freelance_work"}
        },
        {
            "text": "I try to communicate clearly in a team, especially in writing — good PR descriptions, README files that explain why something exists, not just what it does. I'm comfortable getting code review in both directions and I try not to take it personally. Coming from a non-developer background also means I've had a lot of practice talking to people who don't speak tech, which I think helps in cross-functional teams.",
            "metadata": {"category": "soft_skills", "topic": "teamwork"}
        },
        {
            "text": "When I'm stuck on a problem I try to break it down. First, can I reproduce it in the smallest possible setup. Then I check my assumptions — is the input what I think it is, the version what I think it is, the network doing what I think it is. If I'm still stuck after a while, I ask for help, and I try to write the question clearly, because half the time writing it out makes me see the answer. I use AI tools as part of the process, but I don't ship code I can't explain.",
            "metadata": {"category": "soft_skills", "topic": "problem_solving"}
        },
        {
            "text": "The cryptomining attack on my Hetzner server is the most honest mistake I've made. I had set things up with reasonable but not very strict security, and a misconfigured service got compromised. I learned what proper baseline hardening actually looks like — UFW, SSH key-only auth, fail2ban, no public Docker daemons, watching CPU as an early warning. Now I treat server setup as a real task, not something I copy from a tutorial.",
            "metadata": {"category": "soft_skills", "topic": "lessons_learned"}
        },
        {
            "text": "Yes, I'm currently employed. I work full-time at Jula AB and have been there for 17 years. I do freelance and personal projects on the side and bill those through a third-party invoicing company. I'm open to talking about new opportunities in development where the role and the team feel like a good fit.",
            "metadata": {"category": "logistics", "topic": "current_employment"}
        },
        {
            "text": "I'm looking for a junior developer role where I can ship real product code in a modern stack, ideally with some exposure to AI or mobile, and where there's room to grow. I recently applied for a Mobile App Developer (Android) role at Infobric Group, which is a good shape of role for me — native Android, real product, real users.",
            "metadata": {"category": "logistics", "topic": "role_preferences"}
        },
        {
            "text": "In a few years I see myself somewhere I'm a confident developer who's trusted with real ownership of features, working on a product that real people use. I don't know yet whether I'd lean more toward IC work or eventually toward a lead track — right now I just want to keep building, keep learning, and stay close to the product and the users.",
            "metadata": {"category": "logistics", "topic": "career_goals"}
        },
        {
            "text": "Why hire me as a junior developer? I ship. My GitHub isn't a graveyard of half-finished tutorials — it's projects that are deployed, used, and that I keep maintaining, across web, mobile, AI, and infrastructure. I'm coming into development as a serious career change, so I bring real working-life experience: 17 years at the same company, client communication, deadlines, and the discipline to actually finish things. I know I'm still early in my development career, but I'm motivated, I learn fast, and I genuinely love this work.",
            "metadata": {"category": "why_peter", "topic": "value_proposition"}
        },
        {
            "text": "Something about me that isn't on my CV: I'm very creative and at the same time analytical about where things are going — that's the combination that pulled me into development in the first place. I also have an older media background that I quietly use all the time. I edit my own demo videos, write my own marketing copy, and present my projects in a way that not every junior developer can. It also means I'm comfortable being the one who explains things to non-developers, which tends to come in handy.",
            "metadata": {"category": "why_peter", "topic": "unique_traits"}
        }
    ]

    logger.info(f"Adding {len(documents)} documents to knowledge base...")

    for i, doc in enumerate(documents):
        try:
            doc_id = await store.add_document(
                text=doc["text"],
                metadata=doc["metadata"]
            )
            logger.info(f"Added document {i+1}/{len(documents)}: {doc_id}")
        except Exception as e:
            logger.error(f"Failed to add document {i+1}: {e}")

    logger.info("Knowledge base population completed!")


if __name__ == "__main__":
    asyncio.run(populate_knowledge_base())
