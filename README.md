# 🎛️ Harmonix: GenAI Audio Semantic Engine

**Status:** Active Sandbox / Work-In-Progress  
**Core Stack:** Google AI Studio / Gemini API  

## 📍 Origin Story
Prototyped during a "vibe code" workshop in a hotel room in Spain between offsite meetings. 

I spend my day job building enterprise-grade data pipelines and automated triage systems. Harmonix is my off-hours sandbox. It’s a space where I break away from strict corporate SLAs and just tinker with the absolute bleeding edge of Large Language Models to see what breaks, what scales, and what is actually useful.

## ⚙️ What It Does (The Core Concept)
Harmonix is an experimental audio-recommendation framework. You feed it a seed track, and the engine maps the semantic profile of the song to output hyper-specific recommendations.

Instead of standard collaborative filtering (like Spotify's algorithm), this project uses GenAI to output:
* **Deep Genre & Style Matching:** Finding tracks with the exact same sonic architecture and vibe.
* **Music Theory Enrichment:** Identifying the musical key and tempo of the recommendations.
* **Contextual Data:** Auto-generating artist bios and production context for the recommended tracks.

## 🔧 Under the Hood (Architecture Notes)
* **Prompt Engineering as Code:** Utilizing Google AI Studio to fine-tune system instructions and control output constraints, ensuring the model outputs structured musical theory data without hallucinating track metadata.
* **Current Friction Points (The Audio Preview Bug):** Currently attempting to engineer a 10-second audio preview hook. LLMs are text/reasoning engines, not media CDNs, so the model struggles to surface raw audio snippets directly. 
* **Next Steps:** Refactoring the integration layer to act as middleware. The goal is to have Gemini output the JSON payload of the recommendation, which will then trigger an external API call (e.g., Spotify Web API or iTunes Search API) to fetch and serve the raw `.mp3` preview URL.

## 🧠 Why I Built This
As a Dj of over 20 years it was always hard finding music that keeps the same vibe created going and discovering new to you artists and songs can be hard at times so this was made to help with that. 

