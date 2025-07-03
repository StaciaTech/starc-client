import axios from 'axios';

interface ContentGenerationParams {
  courseTitle: string;
  chapterTitle: string;
  subchapterTitle: string;
  sectionTitle: string;
  learningObjectives?: string[];
  keywords?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizGenerationParams {
  courseTitle: string;
  chapterTitle: string;
  subchapterTitle: string;
  sectionTitles: string[];
  sectionContents: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizQuestion {
  questionText: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  points: number;
}

interface GeneratedQuiz {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
}

/**
 * Service to generate AI content for course sections
 */
class AIContentService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    
    // Check if API key is available
    if (!this.apiKey) {
      console.warn('AI_API_KEY environment variable not set. AI content generation will not work.');
    } else {
      console.log('AI content service initialized with endpoint:', this.apiEndpoint);
    }
  }

  /**
   * Generate content for a course section
   * @param params Parameters for content generation
   * @returns Generated content
   */
  async generateSectionContent(params: ContentGenerationParams): Promise<string> {
    try {
      // If no API key, return placeholder text
      if (!this.apiKey) {
        console.warn('No API key available. Using placeholder content.');
        return this.generatePlaceholderContent(params);
      }
      
      console.log(`Generating content for section "${params.sectionTitle}" in "${params.chapterTitle}"`);
      
      const prompt = this.createPrompt(params);
      console.log('Prompt created, sending request to AI service...');
      
      const startTime = Date.now();
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an educational content creator specializing in creating engaging, informative, and structured course content. You are creating content for an e-learning platform."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );
      
      const duration = Date.now() - startTime;
      console.log(`Content generated in ${duration}ms`);
      
      // Extract the generated content from the response
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const generatedContent = response.data.choices[0].message.content.trim();
        console.log(`Generated ${generatedContent.length} characters of content`);
        return generatedContent;
      } else {
        console.error('Invalid response structure from AI service:', response.data);
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error generating AI content:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          console.error('Authentication error: Check your API key');
        } else if (error.response?.status === 429) {
          console.error('Rate limit exceeded: Too many requests to AI service');
        } else if (error.code === 'ECONNABORTED') {
          console.error('Request timeout: AI service took too long to respond');
        }
      } else {
        console.error('Error generating AI content:', error);
      }
      
      console.log('Falling back to placeholder content');
      return this.generatePlaceholderContent(params);
    }
  }

  /**
   * Generate quizzes for a subchapter based on its sections
   * @param params Parameters for quiz generation
   * @returns Array of generated quizzes
   */
  async generateSubchapterQuizzes(params: QuizGenerationParams): Promise<GeneratedQuiz[]> {
    try {
      // If no API key, return placeholder quizzes
      if (!this.apiKey) {
        console.warn('No API key available. Using placeholder quizzes.');
        return this.generatePlaceholderQuizzes(params);
      }
      
      console.log(`Generating quizzes for subchapter "${params.subchapterTitle}" in "${params.chapterTitle}"`);
      
      const prompt = this.createQuizPrompt(params);
      console.log('Quiz prompt created, sending request to AI service...');
      
      const startTime = Date.now();
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an educational assessment expert specializing in creating effective quizzes and tests. You are creating quizzes for an e-learning platform."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 120 second timeout for quiz generation
        }
      );
      
      const duration = Date.now() - startTime;
      console.log(`Quizzes generated in ${duration}ms`);
      
      // Extract the generated content from the response
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const generatedContent = response.data.choices[0].message.content.trim();
        console.log(`Generated ${generatedContent.length} characters of quiz content`);
        
        try {
          const parsedQuizzes = JSON.parse(generatedContent);
          if (Array.isArray(parsedQuizzes.quizzes) && parsedQuizzes.quizzes.length > 0) {
            return parsedQuizzes.quizzes;
          } else {
            console.error('Invalid quiz format returned from AI service');
            return this.generatePlaceholderQuizzes(params);
          }
        } catch (parseError) {
          console.error('Error parsing quiz JSON:', parseError);
          return this.generatePlaceholderQuizzes(params);
        }
      } else {
        console.error('Invalid response structure from AI service:', response.data);
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error generating quizzes:', error);
      return this.generatePlaceholderQuizzes(params);
    }
  }

  /**
   * Create a prompt for the AI based on the parameters
   * @param params Parameters for content generation
   * @returns Prompt string
   */
  private createPrompt(params: ContentGenerationParams): string {
    const { 
      courseTitle, 
      chapterTitle, 
      subchapterTitle, 
      sectionTitle, 
      learningObjectives = [], 
      keywords = [],
      level = 'intermediate'
    } = params;
    
    let prompt = `Create educational content for a section of an online course with the following details:
Course: "${courseTitle}"
Chapter: "${chapterTitle}"
Subchapter: "${subchapterTitle}"
Section: "${sectionTitle}"
Difficulty Level: ${level}
`;

    // Add learning objectives if available
    if (learningObjectives.length > 0) {
      prompt += `\nLearning Objectives:\n${learningObjectives.map(obj => `- ${obj}`).join('\n')}`;
    }

    // Add keywords if available
    if (keywords.length > 0) {
      prompt += `\nKeywords: ${keywords.join(', ')}`;
    }

    prompt += `\n\nPlease structure your content with:
1. A brief introduction to the topic
2. Main content with relevant examples
3. Key points summary
4. A practice exercise or reflection question

Format the content using markdown for headings, bullet points, code blocks if relevant, etc.`;

    return prompt;
  }

  /**
   * Create a prompt for quiz generation
   * @param params Parameters for quiz generation
   * @returns Prompt string
   */
  private createQuizPrompt(params: QuizGenerationParams): string {
    const { 
      courseTitle, 
      chapterTitle, 
      subchapterTitle, 
      sectionTitles,
      sectionContents,
      level = 'intermediate'
    } = params;
    
    let prompt = `Create 3 quizzes for a subchapter of an online course with the following details:
Course: "${courseTitle}"
Chapter: "${chapterTitle}"
Subchapter: "${subchapterTitle}"
Difficulty Level: ${level}

This subchapter contains the following sections:
${sectionTitles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

Here's the content of these sections to help you create relevant questions:

${sectionContents.map((content, index) => `--- SECTION ${index + 1}: ${sectionTitles[index]} ---\n${content.substring(0, 500)}...\n`).join('\n\n')}

Please create 3 quizzes for this subchapter:
1. A beginner-level quiz with basic knowledge questions
2. An intermediate-level quiz with application questions
3. An advanced-level quiz with analysis and synthesis questions

Each quiz should have:
- A descriptive title
- A brief description explaining what the quiz covers
- A time limit in minutes (appropriate for the difficulty)
- A passing score percentage (typically 70%)
- 5 multiple-choice questions per quiz

For each question, include:
- The question text
- 4 options (with exactly one correct answer)
- Mark which option is correct
- A brief explanation of why the correct answer is right
- Points value (default 10 points per question)

Return your response as a JSON object with this exact structure:
{
  "quizzes": [
    {
      "title": "Quiz title",
      "description": "Quiz description",
      "timeLimit": 10,
      "passingScore": 70,
      "questions": [
        {
          "questionText": "Question text",
          "options": [
            {"optionText": "Option 1", "isCorrect": false},
            {"optionText": "Option 2", "isCorrect": true},
            {"optionText": "Option 3", "isCorrect": false},
            {"optionText": "Option 4", "isCorrect": false}
          ],
          "explanation": "Explanation of the correct answer",
          "points": 10
        }
        // more questions...
      ]
    }
    // more quizzes...
  ]
}
`;

    return prompt;
  }

  /**
   * Generate placeholder content when AI generation is not available
   * @param params Parameters for content generation
   * @returns Placeholder content
   */
  private generatePlaceholderContent(params: ContentGenerationParams): string {
    const { courseTitle, chapterTitle, subchapterTitle, sectionTitle } = params;
    
    return `# ${sectionTitle}

## Introduction
This is placeholder content for the section "${sectionTitle}" in subchapter "${subchapterTitle}" of chapter "${chapterTitle}" in the course "${courseTitle}".

## Main Content
Content would normally be generated using AI, but the API key is not configured.

## Key Points
- Key point 1
- Key point 2
- Key point 3

## Practice Exercise
Try to answer the following question: What are the main concepts covered in this section?`;
  }

  /**
   * Generate placeholder quizzes when AI generation is not available
   * @param params Parameters for quiz generation
   * @returns Array of placeholder quizzes
   */
  private generatePlaceholderQuizzes(params: QuizGenerationParams): GeneratedQuiz[] {
    const { subchapterTitle } = params;
    
    const placeholderQuiz: GeneratedQuiz = {
      title: `${subchapterTitle} Quiz`,
      description: `This is a placeholder quiz for ${subchapterTitle}. AI generation is not available.`,
      timeLimit: 15,
      passingScore: 70,
      questions: [
        {
          questionText: "This is a placeholder question. What would be the correct answer?",
          options: [
            { optionText: "This is the correct answer", isCorrect: true },
            { optionText: "This is incorrect", isCorrect: false },
            { optionText: "This is also incorrect", isCorrect: false },
            { optionText: "This is wrong too", isCorrect: false }
          ],
          explanation: "This is a placeholder explanation for the correct answer.",
          points: 10
        },
        {
          questionText: "Second placeholder question?",
          options: [
            { optionText: "Wrong answer", isCorrect: false },
            { optionText: "Correct answer", isCorrect: true },
            { optionText: "Wrong answer", isCorrect: false },
            { optionText: "Wrong answer", isCorrect: false }
          ],
          explanation: "Explanation for the second question.",
          points: 10
        }
      ]
    };
    
    // Return three placeholder quizzes with different titles
    return [
      { ...placeholderQuiz, title: `${subchapterTitle} - Basic Quiz` },
      { ...placeholderQuiz, title: `${subchapterTitle} - Intermediate Quiz` },
      { ...placeholderQuiz, title: `${subchapterTitle} - Advanced Quiz` }
    ];
  }
}

export default new AIContentService(); 