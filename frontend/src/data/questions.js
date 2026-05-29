// Structured question bank — role + difficulty based

export const QUESTION_BANK = {
  HR: {
    beginner: [
      "Tell me about yourself.",
      "Why do you want to work here?",
      "What are your strengths?",
      "What are your weaknesses?",
      "Where do you see yourself in 5 years?",
      "Why are you leaving your current job?",
      "What motivates you at work?",
      "Describe your ideal work environment.",
      "How do you handle stress or pressure?",
      "Tell me about a time you worked in a team.",
    ],
    intermediate: [
      "Describe a situation where you had to resolve a conflict with a colleague.",
      "Tell me about a time you failed and what you learned from it.",
      "How do you prioritize when you have multiple deadlines?",
      "Give an example of a time you showed leadership.",
      "How do you handle negative feedback?",
      "Describe a time you went above and beyond for a customer or colleague.",
      "How do you adapt to change in the workplace?",
      "Tell me about a time you had to make a difficult decision.",
      "How do you manage your time effectively?",
      "Describe a project you are most proud of.",
    ],
    advanced: [
      "How would you handle a situation where your manager's expectations are unrealistic?",
      "Describe a time you had to influence without authority.",
      "How do you build trust with cross-functional teams?",
      "Give an example of how you drove culture change in an organization.",
      "How do you manage underperforming team members?",
      "Describe a time you had to deliver bad news to stakeholders.",
      "How do you balance innovation with risk management?",
    ]
  },
  Technical: {
    beginner: [
      "Explain the difference between a stack and a queue.",
      "What is Object-Oriented Programming?",
      "What is the difference between SQL and NoSQL databases?",
      "Explain what an API is.",
      "What is version control and why is it important?",
      "What is the difference between GET and POST requests?",
      "Explain what a primary key is in a database.",
      "What is the difference between == and === in JavaScript?",
      "What does HTML stand for and what is its purpose?",
      "Explain what a for loop does.",
    ],
    intermediate: [
      "Explain RESTful API design principles.",
      "What is the difference between synchronous and asynchronous programming?",
      "Explain normalization in databases.",
      "What is a binary search tree?",
      "What is the difference between TCP and UDP?",
      "Explain the concept of caching and when you would use it.",
      "What is a microservices architecture?",
      "Explain Big O notation.",
      "What is CORS and why does it matter?",
      "How does garbage collection work?",
    ],
    advanced: [
      "Design a URL shortening service like bit.ly.",
      "How would you scale a system to handle 1 million users?",
      "Explain CAP theorem with a real-world example.",
      "How would you design a distributed cache?",
      "What is the difference between horizontal and vertical scaling?",
      "Explain eventual consistency.",
      "How do you handle database transactions in a distributed system?",
    ]
  },
  'Data Analyst': {
    beginner: [
      "What is the difference between mean, median, and mode?",
      "What is a pivot table?",
      "What tools have you used for data analysis?",
      "Explain what SQL JOIN types exist.",
      "What is the difference between structured and unstructured data?",
      "What is data cleaning and why is it important?",
      "Explain what a dashboard is and its purpose.",
    ],
    intermediate: [
      "Explain the difference between regression and classification.",
      "What is A/B testing and how do you design one?",
      "How do you handle missing data in a dataset?",
      "Explain the concept of statistical significance.",
      "What is the difference between correlation and causation?",
      "How would you detect and handle outliers?",
      "Describe a time you used data to influence a business decision.",
    ],
    advanced: [
      "How would you design a data pipeline for real-time analytics?",
      "Explain dimensional modeling and star schema.",
      "How do you measure the success of a product feature using data?",
      "What is multicollinearity and how do you address it?",
      "How would you build a customer churn prediction model?",
    ]
  },
  'AI/ML': {
    beginner: [
      "What is the difference between supervised and unsupervised learning?",
      "What is overfitting and how do you prevent it?",
      "Explain what a neural network is.",
      "What is the train/test split and why do we use it?",
      "What is gradient descent?",
      "What are hyperparameters?",
    ],
    intermediate: [
      "Explain the bias-variance tradeoff.",
      "What is cross-validation and why is it important?",
      "Explain how a Random Forest works.",
      "What is the difference between L1 and L2 regularization?",
      "How does backpropagation work?",
      "What is transfer learning?",
      "Explain attention mechanisms in transformers.",
    ],
    advanced: [
      "How would you design an ML system for production?",
      "How do you monitor ML models in production?",
      "Explain the difference between BERT and GPT architectures.",
      "How would you handle class imbalance in a classification problem?",
      "What is model drift and how do you address it?",
    ]
  },
  ServiceNow: {
    beginner: [
      "What is ServiceNow and what problems does it solve?",
      "What is an Incident in ServiceNow?",
      "What is the difference between Incident and Problem Management?",
      "What is a ServiceNow catalog item?",
      "What is a workflow in ServiceNow?",
    ],
    intermediate: [
      "Explain the ServiceNow data model and table hierarchy.",
      "What are Business Rules in ServiceNow and when do you use them?",
      "What is a ServiceNow Update Set?",
      "How does the ServiceNow CMDB work?",
      "What are ACLs in ServiceNow?",
      "Explain the difference between a UI Action and a Business Rule.",
    ],
    advanced: [
      "How would you design a custom application in ServiceNow?",
      "Explain ServiceNow Integration Hub and REST API patterns.",
      "How do you optimize ServiceNow performance for large deployments?",
      "What is the ServiceNow Workflow Engine vs Flow Designer?",
    ]
  },
  Coding: {
    beginner: [
      "Write a function to reverse a string.",
      "Write a function to check if a number is prime.",
      "How would you find duplicates in an array?",
      "Write a function to compute the factorial of a number.",
      "How do you check if a string is a palindrome?",
    ],
    intermediate: [
      "Implement a binary search algorithm.",
      "Write a function to flatten a nested array.",
      "Implement a linked list with insert and delete operations.",
      "Write a function to find the longest common substring.",
      "Implement a debounce function.",
      "Given an array of integers, find two numbers that sum to a target.",
    ],
    advanced: [
      "Design and implement an LRU cache.",
      "Implement a Trie data structure.",
      "Solve the N-Queens problem.",
      "Implement Dijkstra's shortest path algorithm.",
      "Design a rate limiter.",
    ]
  },
  'Custom Role': {
    beginner: [
      "Tell me about yourself and your background.",
      "What relevant skills do you bring to this role?",
      "What interests you about this position?",
      "Describe your most recent project or work.",
      "What tools or technologies are you most comfortable with?",
    ],
    intermediate: [
      "Describe a challenging problem you solved in your last role.",
      "How do you stay updated in your field?",
      "Give an example of collaborating with a cross-functional team.",
      "What would your previous colleagues say about your work style?",
      "How do you approach learning a new technology or skill?",
    ],
    advanced: [
      "How would you contribute to this team in the first 90 days?",
      "Describe your approach to mentoring others.",
      "How have you driven measurable impact in your career?",
      "What is your philosophy on technical debt?",
    ]
  }
}

export const ROLES = Object.keys(QUESTION_BANK)
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
export const QUESTION_COUNTS = [5, 10, 15]

export function getQuestions(role, difficulty, count) {
  const pool = QUESTION_BANK[role]?.[difficulty] || QUESTION_BANK['HR']['beginner']
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Contextual follow-up bank
export const FOLLOWUPS = [
  "Can you give a specific example of that?",
  "What was the outcome of that situation?",
  "How did that experience shape your approach going forward?",
  "What would you do differently if you faced that again?",
  "How did you measure the success of that?",
  "What was the most challenging aspect of that?",
  "Who else was involved and what was your specific role?",
  "What did you learn from that experience?",
]

export function getFollowUp() {
  return FOLLOWUPS[Math.floor(Math.random() * FOLLOWUPS.length)]
}
