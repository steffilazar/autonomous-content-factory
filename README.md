# Autonomous Content Factory

## Project Title

Autonomous Content Factory

---

## The Problem

Creating content for multiple platforms such as blogs, social media, and email is time-consuming and repetitive. Teams often struggle to maintain consistency across channels and face content burnout due to manual repurposing of the same information.

---

## The Solution

The Autonomous Content Factory is an AI-powered multi-agent system that converts a single input document into a complete marketing campaign.

The system uses three agents:

* Researcher: Extracts key insights from the input document
* Copywriter: Generates content for blog, social media, and email
* Editor: Refines content for clarity, tone, and consistency

Key features:

* Multi-agent pipeline workflow
* Section-wise regeneration (blog, social thread, email)
* Human-in-the-loop approval system
* Real-time agent activity logs
* File upload support (.txt, .md)
* One-click export (ZIP and clipboard)
* Responsive preview

---

## Tech Stack

Programming Languages:

* TypeScript

Frameworks and Libraries:

* Next.js (App Router)
* React
* Tailwind CSS
* Framer Motion

APIs:

* Groq API (LLaMA 3.3 70B model)

Utilities:

* JSZip
* FileSaver.js

---

## Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/steffilazar/autonomous-content-factory.git
cd autonomous-content-factory
```

2. Install dependencies

```bash
npm install
```

3. Add environment variables
   Create a `.env.local` file and add:

```env
GROQ_API_KEY=your_api_key_here
```

4. Run the project

```bash
npm run dev
```

5. Open in browser
   http://localhost:3000

---

## Video Demo

https://www.loom.com/share/4e70e6daa8604a64be21484b06d4b81d

---

## Live Demo (Optional)

https://autonomous-content-factory-nu.vercel.app
