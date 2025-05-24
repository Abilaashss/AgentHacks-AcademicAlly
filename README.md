# Paper Pulse

Paper Pulse is an AI-powered research paper analysis tool designed to help researchers efficiently extract insights from academic papers. Using advanced NLP techniques and the Llama 3 language model, Paper Pulse automates literature review by summarizing papers, extracting key trends, and analyzing research gaps.

## Features

- **Paper Search**: Search for research papers across multiple sources (arXiv, Semantic Scholar)
- **AI Summaries**: Generate concise summaries of papers using Llama 3 8B
- **Trend Analysis**: Identify emerging trends, methodologies, and research directions
- **Gap Analysis**: Discover unexplored areas and future research opportunities
- **User-friendly Interface**: Modern, clean UI inspired by perplexity.ai

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI Model**: Meta Llama 3 8B (via Together AI)
- **APIs**: arXiv API, Semantic Scholar API

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- [Together AI](https://together.ai) API key for Llama 3 model access

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd paper-pulse
   ```

2. Install dependencies for all components:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   
   Create a `.env` file in the `backend` directory based on `.env.example`:
   
   ```
   PORT=5000
   TOGETHER_API_KEY=your_together_ai_api_key_here
   ```

### Running the Application

**Development Mode:**

```bash
npm run dev
```

This will start both the backend and frontend in development mode.

**Production Mode:**

```bash
npm start
```

## Usage

1. **Search for Papers**: Enter a topic, keywords, or author names in the search bar
2. **View Paper Details**: Click on a paper card to view its detailed information
3. **Generate a Summary**: On the paper details page, click "Generate Summary"
4. **Analyze Trends/Gaps**: On the Analysis page, select papers, define your research topic, and run the analysis

## Architecture

Paper Pulse follows a client-server architecture:

- **Frontend**: React-based web UI with a design inspired by perplexity.ai
- **Backend**: Express.js API server that interfaces with external paper sources and the AI model
- **External APIs**: Uses arXiv and Semantic Scholar for paper search and retrieval
- **AI Model**: Leverages Llama 3 8B hosted on Together AI for generating summaries and performing analysis

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Paper Pulse uses the Llama 3 8B model from Meta
- Search functionality powered by arXiv and Semantic Scholar APIs
- UI design inspired by perplexity.ai 