const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/completions';
const MODEL_NAME = 'meta-llama/Llama-3-8b-chat-hf';

// Generate a summary for a paper
exports.generateSummary = async (paper) => {
  try {
    const prompt = createSummaryPrompt(paper);
    const response = await callTogetherAPI(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error in generateSummary:', error);
    return 'Unable to generate summary at this time. Please try again later.';
  }
};

// Analyze trends in research papers
exports.analyzeTrends = async (papers, topic) => {
  try {
    console.log('Generating trend analysis for papers:', papers.map(p => p.title).join(', '));
    
    const prompt = createTrendAnalysisPrompt(papers, topic);
    const response = await callTogetherAPI(prompt, 1536);
    
    if (!response || response.trim().length < 100) {
      console.warn(`Received very short trend analysis response (${response?.length || 0} chars). Providing fallback.`);
      return createFallbackTrendAnalysis(papers, topic);
    }
    
    return response.trim();
  } catch (error) {
    console.error('Error in analyzeTrends:', error);
    return createFallbackTrendAnalysis(papers, topic);
  }
};

// Analyze research gaps
exports.analyzeGaps = async (papers, topic, researchQuestion = null) => {
  try {
    console.log('Generating gaps analysis for papers:', papers.map(p => p.title).join(', '));
    
    const prompt = createGapAnalysisPrompt(papers, topic, researchQuestion);
    const response = await callTogetherAPI(prompt, 1536);
    
    if (!response || response.trim().length < 100) {
      console.warn(`Received very short gaps analysis response (${response?.length || 0} chars). Providing fallback.`);
      return createFallbackGapAnalysis(papers, topic, researchQuestion);
    }
    
    return response.trim();
  } catch (error) {
    console.error('Error in analyzeGaps:', error);
    return createFallbackGapAnalysis(papers, topic, researchQuestion);
  }
};

// Generate a comprehensive literature survey
exports.generateLiteratureSurvey = async (papers, topic) => {
  try {
    console.log('Generating literature survey for topic:', topic);
    console.log('Using papers:', papers.map(p => p.title).join(', '));
    
    // Prepare context with detailed information about each paper
    const paperInfo = papers.map((paper, index) => {
      return `
PAPER ${index + 1}: "${paper.title}"
Authors: ${paper.authors.join(', ')}
Year: ${paper.year || 'Unknown'}
${paper.venue ? `Venue: ${paper.venue}` : ''}
Abstract: ${paper.abstract}
${paper.url ? `URL: ${paper.url}` : ''}
`;
    }).join('\n\n');
    
    // Append citation index information for proper referencing
    const citationInfo = papers.map((paper, index) => {
      const authors = paper.authors.length > 0 
        ? paper.authors[0] + (paper.authors.length > 1 ? ' et al.' : '') 
        : 'Unknown';
      const year = paper.year || 'n.d.';
      return `[${index + 1}] ${authors}, ${year}. ${paper.title}. ${paper.venue || ''}`;
    }).join('\n');
    
    const prompt = `
You are a senior academic researcher writing the "Prior Work" or "Related Work" section of a research paper on "${topic}".

I have provided you with ${papers.length} papers relevant to this topic. Your task is to write a comprehensive, academically rigorous "Related Work" section that:

1. Contextualizes the selected papers within the broader research landscape of ${topic}
2. Organizes the literature in a logical manner (chronological, thematic, or methodological)
3. Critically analyzes the approaches, methodologies, and contributions of each paper
4. Draws connections between papers, identifying shared themes or contradictions
5. Highlights how these works collectively advance the field
6. Uses formal academic writing style with proper in-text citations

When citing a paper, use the citation format [n] where n corresponds to the paper number in the list below.

Here are the papers:
${paperInfo}

For citation references:
${citationInfo}

IMPORTANT GUIDELINES:
- Write in the style of a formal academic research paper's "Related Work" section
- Begin with a brief overview paragraph that situates the literature in the field
- Group related works by themes, approaches, or progression of ideas
- Analyze strengths and limitations of different approaches
- Make connections between the works to show your understanding of the research landscape
- End with a brief paragraph that summarizes the state of the field and identifies gaps
- Use formal academic language and avoid first-person pronouns
- Keep paragraphs focused and cohesive
- Maintain an objective, analytical tone throughout
- Ensure every claim about prior work is properly cited with the [n] format
- Use Markdown formatting for structure (## for section headings, etc.)

The literature review should be detailed, academically rigorous, and formatted as it would appear in a published research paper.

IMPORTANT: Format your response with proper Markdown sections:
## 2. Related Work (as the main heading)
Then use ### for subsections like:
### 2.1 [First theme or approach]
### 2.2 [Second theme or approach]
And so on.
`;

    // Generate survey using the LLM with increased tokens
    const response = await callTogetherAPI(prompt, 3072); // Increased token limit
    
    if (response) {
      // Check if response is valid and has minimum length
      if (response.trim().length < 500) {
        console.warn(`Generated survey is suspiciously short (${response.trim().length} chars). Providing fallback response.`);
        
        // If response is too short, return a descriptive error message as the survey
        const fallbackResponse = `
## 2. Related Work on ${topic}

**Note: The system was unable to generate a comprehensive literature survey with the selected papers. This could be due to:**

1. Limited information in the provided papers
2. API limitations or rate limiting
3. Temporary service disruption

### Papers Analyzed

${papers.map((paper, index) => `* **[${index + 1}]** ${paper.title} by ${paper.authors.join(', ')} (${paper.year || 'n.d.'})${paper.venue ? ` in *${paper.venue}*` : ''}`).join('\n')}

### Recommendation

Please try again with:
* More detailed papers on the topic
* A more specific research topic
* Fewer papers if you're experiencing rate limiting
        `;
        
        return fallbackResponse;
      }
      
      // Ensure response starts with a proper heading if it doesn't already
      let formattedResponse = response.trim();
      if (!formattedResponse.startsWith('#')) {
        formattedResponse = `## 2. Related Work on ${topic}\n\n` + formattedResponse;
      }
      
      return formattedResponse;
    } else {
      throw new Error('Failed to generate literature survey. Please try again.');
    }
  } catch (error) {
    console.error('Error in literature survey generation:', error);
    throw error;
  }
};

// Generate and validate a novel hypothesis
exports.generateHypothesis = async (papers, topic) => {
  try {
    console.log('Generating hypothesis for topic:', topic);
    const prompt = createHypothesisPrompt(papers, topic);
    const response = await callTogetherAPI(prompt, 1536);
    if (!response || response.trim().length < 100) {
      console.warn(`Received very short hypothesis response (${response?.length || 0} chars). Providing fallback.`);
      return createFallbackHypothesis(papers, topic);
    }
    return response.trim();
  } catch (error) {
    console.error('Error in generateHypothesis:', error);
    return createFallbackHypothesis(papers, topic);
  }
};

// Call the Together AI API
const callTogetherAPI = async (prompt, max_tokens = 1024) => {
  try {
    if (!TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not set in environment variables');
    }
    
    console.log(`Calling Together API with ${max_tokens} max tokens`);
    
    // Implement exponential backoff for retries
    let retries = 0;
    const maxRetries = 2;
    const baseDelay = 1000; // 1 second
    
    while (retries <= maxRetries) {
      try {
        const response = await axios.post(
          TOGETHER_API_URL,
          {
            model: MODEL_NAME,
            prompt: prompt,
            max_tokens: max_tokens,
            temperature: 0.3,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: ["<|im_end|>"]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TOGETHER_API_KEY}`
            },
            timeout: 30000 // 30 second timeout
          }
        );
        
        // Extract the generated text from the response
        if (response.data && response.data.choices && response.data.choices.length > 0) {
          // Log response stats
          const generatedText = response.data.choices[0].text;
          console.log(`API response received: ${generatedText.length} chars`);
          
          // Check if response is almost empty
          if (generatedText.trim().length < 50) {
            console.error('API returned nearly empty response. Raw response:', JSON.stringify(response.data));
          }
          
          return generatedText;
        } else {
          console.error('Invalid response format from Together API:', JSON.stringify(response.data));
          throw new Error('Invalid response from Together API');
        }
      } catch (error) {
        retries++;
        
        // If this was the last retry, throw the error
        if (retries > maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
        console.warn(`API call failed (attempt ${retries}/${maxRetries}), retrying in ${Math.round(delay/1000)}s: ${error.message}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } catch (error) {
    console.error('Error calling Together API:', error);
    
    // For development without API key, return mock responses
    if (!TOGETHER_API_KEY || error.message.includes('TOGETHER_API_KEY is not set')) {
      console.warn('Using mock LLM response due to missing API key');
      return getMockResponse(prompt);
    }
    
    throw error;
  }
};

// Create a prompt for paper summarization
const createSummaryPrompt = (paper) => {
  return `<|im_start|>system
You are an expert academic assistant trained to generate concise, insightful summaries of research papers. 
Focus on key findings, methodologies, and implications. Be factual and objective.
<|im_end|>
<|im_start|>user
Please provide a comprehensive yet concise summary of the following research paper:

Title: ${paper.title}
${paper.authors ? `Authors: ${paper.authors.join(', ')}` : ''}
${paper.publishedDate ? `Publication Date: ${paper.publishedDate}` : ''}
${paper.venue ? `Venue: ${paper.venue}` : ''}

Abstract:
${paper.abstract || 'No abstract available.'}

Focus on the key findings, methodology, and implications. Structure your summary to highlight:
1. Main objective and research question
2. Methodology used
3. Key findings and results
4. Implications and importance of the research
5. Any limitations mentioned
<|im_end|>
<|im_start|>assistant`;
};

// Create a prompt for trend analysis
const createTrendAnalysisPrompt = (papers, topic) => {
  // Create a concise representation of each paper
  const paperSummaries = papers.map((paper, index) => {
    return `Paper ${index + 1}: "${paper.title}"
Authors: ${paper.authors ? paper.authors.join(', ') : 'N/A'}
Year: ${paper.year || 'N/A'}
Abstract: ${paper.abstract || 'No abstract available'}
`;
  }).join('\n\n');

  return `<|im_start|>system
You are an expert academic assistant specialized in identifying research trends across multiple papers. 
Analyze the provided papers to identify emerging patterns, methodologies, and research directions.
<|im_end|>
<|im_start|>user
Please analyze the following research papers related to "${topic}" and identify key trends, methodological approaches, and emerging research directions:

${paperSummaries}

Provide a detailed analysis that covers:
1. Major trends observed across these papers
2. Evolution of methodologies or approaches
3. Emerging research directions or questions
4. Common themes or findings
5. Any shifts in focus or perspective over time (if relevant)
<|im_end|>
<|im_start|>assistant`;
};

// Create a prompt for gap analysis
const createGapAnalysisPrompt = (papers, topic, researchQuestion) => {
  // Create a concise representation of each paper
  const paperSummaries = papers.map((paper, index) => {
    return `Paper ${index + 1}: "${paper.title}"
Authors: ${paper.authors ? paper.authors.join(', ') : 'N/A'}
Year: ${paper.year || 'N/A'}
Abstract: ${paper.abstract || 'No abstract available'}
`;
  }).join('\n\n');

  const questionContext = researchQuestion 
    ? `with a focus on the research question: "${researchQuestion}"` 
    : '';

  return `<|im_start|>system
You are an expert academic assistant specializing in identifying research gaps and future opportunities from scientific literature.
Analyze the provided papers critically to identify unexplored areas, methodological limitations, and potential future research directions.
<|im_end|>
<|im_start|>user
Please analyze the following research papers in the field of "${topic}" ${questionContext} and identify significant research gaps:

${paperSummaries}

Provide a comprehensive analysis that covers:
1. Major unexplored questions or areas in this field
2. Methodological limitations in the current research
3. Data or resource gaps
4. Contradictory findings that need resolution
5. Specific recommendations for future research direction
6. Potential interdisciplinary approaches that could be valuable

Frame your analysis to be constructive and actionable for researchers looking to contribute meaningfully to this field.
<|im_end|>
<|im_start|>assistant`;
};

// Create a prompt for hypothesis generation and validation
const createHypothesisPrompt = (papers, topic) => {
  const paperSummaries = papers.map((paper, index) => {
    return `Paper ${index + 1}: "${paper.title}"
Authors: ${paper.authors ? paper.authors.join(', ') : 'N/A'}
Year: ${paper.year || 'N/A'}
Abstract: ${paper.abstract || 'No abstract available'}
`;
  }).join('\n\n');

  return `<|im_start|>system\nYou are an advanced academic research assistant. Your task is to propose a truly novel, researchable hypothesis in the field of \"${topic}\" based on the provided papers.\n\nYou must:\n- Carefully analyze the provided papers to identify and summarize the most significant research gaps, limitations, and unresolved questions.\n- Propose a hypothesis that directly addresses one or more of these gaps or limitations.\n- Ensure the hypothesis is not a generic or obvious extension, but something that is not already addressed in the literature.\n- Justify why this hypothesis is novel and important, referencing specific limitations or gaps in the cited papers.\n- Reference the specific papers (by title or number) and their limitations/gaps as motivation.\n- Avoid generic, incremental, or already well-studied hypotheses.\n- Present your output in a clear, academic style using Markdown.\n\n<|im_end|>\n<|im_start|>user\nGiven the following research papers on \"${topic}\":\n\n${paperSummaries}\n\nPlease follow this structure:\n\n## 1. Identified Research Gaps and Limitations\n- List and explain the most important gaps, limitations, or unresolved questions in the provided papers.\n- Reference the relevant papers for each gap.\n\n## 2. Proposed Novel Hypothesis\n- Clearly state a hypothesis that directly addresses one or more of the above gaps.\n- The hypothesis must be specific, actionable, and not a generic extension of existing work.\n\n## 3. Justification for Novelty and Importance\n- Explain why this hypothesis is new and not already addressed in the literature.\n- Justify its potential impact and importance.\n\n## 4. Validation with Literature\n- Reference supporting evidence, gaps, or trends from the provided papers.\n- List the specific papers (by title or number) that support or motivate the hypothesis.\n\n## 5. References\n- List the papers that support the hypothesis.\n\n<|im_end|>\n<|im_start|>assistant`;
};

// Fallback for hypothesis generation
const createFallbackHypothesis = (papers, topic) => {
  return `## Proposed Hypothesis\nA novel hypothesis for the field of ${topic} could be: \n\n*"Integrating multimodal data sources (e.g., text, images, and sensor data) will significantly improve the accuracy and generalizability of predictive models in ${topic}, especially in underexplored subdomains."*\n\n## Justification\nWhile several papers have explored single-modality approaches, there is limited research on the synergistic effects of combining multiple data types. This hypothesis addresses a gap in the literature and could open new avenues for research.\n\n## Validation with Literature\n- Paper 1 and Paper 2 highlight the limitations of single-modality models.\n- Paper 3 suggests potential benefits of multimodal integration but does not empirically test it.\n\n## References\n- [1] Example Paper 1\n- [2] Example Paper 2\n- [3] Example Paper 3\n`;
};

// Provide mock responses for development when no API key is available
const getMockResponse = (prompt = '') => {
  // Extract topic from prompt for more realistic mock responses
  let topic = "research";
  const topicMatch = prompt.match(/topic of "([^"]+)"/);
  if (topicMatch && topicMatch[1]) {
    topic = topicMatch[1];
  }
  
  if (prompt.includes('literature survey') || prompt.includes('Related Work')) {
    return `
## 2. Related Work

Research in the domain of ${topic} has evolved significantly over the past decade. This section reviews key contributions and methodological approaches that form the foundation of current understanding in this field.

### 2.1 Foundational Approaches

The earliest work in this domain established the core principles that continue to guide contemporary research. Smith et al. [1] introduced a framework for analyzing complex patterns in data, demonstrating improved accuracy over previous methods. Their approach, based on statistical modeling and feature extraction, achieved a 15% performance gain over baseline methods on standard benchmarks. Building upon this foundation, Johnson and colleagues [2] extended the methodology to accommodate multi-modal input, which proved particularly effective for heterogeneous datasets.

### 2.2 Advanced Techniques and Methodologies

More recent contributions have focused on addressing limitations in earlier approaches. The work by Zhang et al. [1] represents a significant advancement through the introduction of adaptive learning mechanisms that dynamically adjust to changing data distributions. Their experiments demonstrated robust performance across diverse scenarios, although computational efficiency remains a challenge for large-scale implementations.

In parallel, Lee and Wang [2] proposed an alternative approach that prioritizes efficiency without sacrificing accuracy. Their method reduced computational requirements by approximately 40% while maintaining comparable performance metrics to state-of-the-art systems. This balance between efficiency and effectiveness addresses a critical gap in the literature and offers promising directions for resource-constrained applications.

### 2.3 Current Limitations and Research Gaps

Despite these advancements, several limitations persist in the current literature. First, the majority of studies focus on controlled environments that may not adequately represent real-world complexity [1]. Second, there remains a notable absence of comprehensive comparative analyses across different methodological approaches [2]. Additionally, most existing work emphasizes algorithmic improvements without sufficient attention to interpretability and explainability—factors that are increasingly critical for practical applications.

The body of literature on ${topic} reflects significant progress, yet opportunities remain for more robust evaluation frameworks, enhanced adaptability to dynamic environments, and integration with complementary research domains. Future work would benefit from addressing these gaps while building upon the methodological strengths established in the reviewed literature.
`;
  }
  
  if (prompt.includes('Propose a novel, researchable hypothesis')) {
    return createFallbackHypothesis([], topic);
  }
  
  const mockResponses = [
    "This paper presents a novel approach to natural language processing using transformer architectures. The authors introduce a new pre-training method that significantly improves performance across several benchmark tasks. Their methodology combines aspects of contrastive learning with traditional masked language modeling. Key findings include a 3.2% improvement on the GLUE benchmark and better sample efficiency during fine-tuning. The implications of this work are significant for low-resource languages and specialized domains. However, the authors acknowledge limitations in computational requirements and potential biases in the training data.",
    
    "Major research trends observed include: 1) Increasing use of multi-modal approaches combining text, image, and sometimes audio data; 2) Growing emphasis on explainable AI techniques rather than black-box models; 3) Shift toward self-supervised learning methods requiring less labeled data; 4) Integration of domain knowledge through structured priors and constraints; 5) Focus on energy efficiency and model compression. Methodologically, there's a clear evolution from single-architecture approaches to ensemble and hybrid models. Emerging research directions point toward federated learning systems, robustness to distribution shifts, and ethical considerations in model deployment.",
    
    "Analysis reveals several significant research gaps: 1) Limited investigation of long-term longitudinal effects, with most studies focusing on immediate outcomes; 2) Methodological shortcomings in control group selection and randomization; 3) Lack of standardized measurement protocols across studies; 4) Insufficient research in diverse demographic populations; 5) Minimal exploration of interaction effects between multiple variables. Future research should prioritize developing standardized protocols, expanding demographic diversity, conducting longitudinal studies, and exploring multivariate interaction effects. Interdisciplinary approaches combining computational modeling with experimental psychology could provide valuable new perspectives."
  ];
  
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

// Create fallback trend analysis
const createFallbackTrendAnalysis = (papers, topic) => {
  return `# Research Trends Analysis: ${topic}

Based on the ${papers.length} papers reviewed, the following research trends can be identified:

## Key Research Trends

1. **Methodological Approaches**: The papers demonstrate various methodological approaches to ${topic}, indicating a diverse research landscape.

2. **Emerging Technologies**: There appears to be increasing interest in applying new technologies to address challenges in this field.

3. **Interdisciplinary Applications**: Several papers show connections between ${topic} and other domains, suggesting growing interdisciplinary research.

## Limitations in Current Research

* Limited sample sizes in some studies
* Need for more longitudinal research
* Opportunities for more diverse geographical representation

## Future Directions

Research in ${topic} is likely to expand in directions that incorporate more advanced computational methods, larger datasets, and cross-disciplinary perspectives.

*Note: This is a generalized analysis. For more specific insights, please review the individual papers in detail.*`;
};

// Create fallback gap analysis
const createFallbackGapAnalysis = (papers, topic, researchQuestion = null) => {
  const questionContext = researchQuestion ? ` related to "${researchQuestion}"` : '';

  return `# Research Gaps Analysis: ${topic}

After reviewing ${papers.length} papers in the field of ${topic}${questionContext}, the following research gaps have been identified:

## Major Research Gaps

1. **Methodological Limitations**: Current research appears to have methodological constraints that future work could address.

2. **Limited Scope**: Many studies focus on narrow aspects of ${topic}, leaving opportunities for more comprehensive approaches.

3. **Integration Challenges**: There seems to be limited research on integrating findings across different sub-areas of ${topic}.

## Recommendations for Future Research

* Develop more comprehensive frameworks that address multiple aspects of ${topic}
* Consider longitudinal studies to track changes over time
* Explore interdisciplinary approaches to enrich the research landscape

## Potential New Research Questions

* How do contextual factors influence outcomes in ${topic}?
* What are the long-term implications of current approaches?
* How can findings from other fields enhance understanding of ${topic}?

*Note: This is a generalized analysis based on limited information. For more specific research gaps, a deeper analysis of the literature is recommended.*`;
}; 