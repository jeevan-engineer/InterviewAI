
const questionBank = {
  easy: [
    {
      question: "Can you introduce yourself and describe your technical background?",
      category: "Introduction",
    },
    {
      question: "Which programming languages are you most comfortable with?",
      category: "Technical",
    },
    {
      question: "Explain the difference between frontend and backend development.",
      category: "Technical",
    },
    {
      question: "Describe one project you have worked on and your contribution.",
      category: "Project",
    },
    {
      question: "What is an API, and why is it used?",
      category: "Technical",
    },
    {
      question: "How do you debug an error in your code?",
      category: "Problem Solving",
    },
    {
      question: "What is the difference between SQL and NoSQL databases?",
      category: "Technical",
    },
    {
      question: "Why are you interested in this job role?",
      category: "HR",
    },
    {
      question: "What are your strengths as a developer?",
      category: "HR",
    },
    {
      question: "How do you learn a new technology?",
      category: "HR",
    },
  ],

  medium: [
    {
      question: "Explain how you would design a scalable application for your chosen role.",
      category: "System Design",
    },
    {
      question: "Describe a challenging technical problem you faced and how you solved it.",
      category: "Problem Solving",
    },
    {
      question: "How would you identify and optimize a slow application?",
      category: "Performance",
    },
    {
      question: "Explain how authentication and authorization work in a web application.",
      category: "Security",
    },
    {
      question: "How would you handle errors and exceptions in a production application?",
      category: "Technical",
    },
    {
      question: "Explain the importance of data structures and algorithms in software development.",
      category: "Technical",
    },
    {
      question: "How would you design and structure a database for a new application?",
      category: "Database",
    },
    {
      question: "How do you test your code before deploying an application?",
      category: "Testing",
    },
    {
      question: "How would you investigate a bug that occurs only in production?",
      category: "Problem Solving",
    },
    {
      question: "How do you manage competing priorities when working on a project?",
      category: "Workplace",
    },
  ],

  hard: [
    {
      question: "Design a highly scalable system that can handle millions of requests.",
      category: "System Design",
    },
    {
      question: "How would you investigate and resolve a memory leak in a production system?",
      category: "Problem Solving",
    },
    {
      question: "Explain the trade-offs between different database architectures for a high-traffic application.",
      category: "Database",
    },
    {
      question: "How would you design a fault-tolerant application with minimal downtime?",
      category: "System Design",
    },
    {
      question: "How would you secure an application against common web vulnerabilities?",
      category: "Security",
    },
    {
      question: "Explain how you would improve the performance of a system experiencing heavy concurrent traffic.",
      category: "Performance",
    },
    {
      question: "How would you investigate a race condition in a concurrent application?",
      category: "Problem Solving",
    },
    {
      question: "Describe how you would design a reliable distributed system.",
      category: "System Design",
    },
    {
      question: "How would you plan a major application migration without disrupting users?",
      category: "Architecture",
    },
    {
      question: "How would you evaluate the trade-offs between consistency and availability in a distributed system?",
      category: "Architecture",
    },
  ],
};

function getQuestions(difficulty, jobRole, experienceLevel) {
  const selectedDifficulty = questionBank[difficulty.toLowerCase()] || questionBank.medium;

  const shuffled = [...selectedDifficulty].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, 8).map((item) => ({
    ...item,
    question: item.question.replace(
      /your chosen role|software development/g,
      jobRole
    ),
  }));
}

module.exports = getQuestions;
