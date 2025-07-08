import React, { useState } from 'react';
import { FaRegQuestionCircle } from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
   {
    question: "What is the EDIFAI platform used for?",
    answer:
      "EDIFAI is an all-in-one learning platform designed to help learners access high-quality courses in Full Stack Development, Mechanical Engineering, UI/UX Design, and IoT. It offers structured learning paths, resources, and design tools to help users build career-ready skills.",
  },
  {
    question: "How do I use the EDIFAI platform as a learner?",
    answer:
      "To use EDIFAI, simply create an account, log in, and navigate to the Courses or Books section. You can browse by category, view course details, and start learning right from your dashboard.",
  },
  {
    question: "What types of content are included in a course?",
    answer:
      "Each course includes video lessons, downloadable resources, quizzes, and practical projects. Some also come with software or hardware setup guides (especially for Mechanical and IoT topics).",
  },
  {
    question: "Does EDIFAI support filtering courses by domain?",
    answer:
      "Yes, EDIFAI allows you to filter courses based on categories like IoT, UI/UX, Full Stack, and Mechanical Engineering, so you can quickly find content relevant to your interests.",
  },
  {
    question: "Are there any free courses or trial options available?",
    answer:
      "Yes, some introductory courses like 'Comprehensive Full Stack Development Program' are available for free. This allows learners to explore the platform before purchasing paid courses.",
  },
  {
    question: "Who can benefit from using EDIFAI?",
    answer:
      "EDIFAI is built for students, early professionals, and career-switchers in tech, engineering, and design fields. Whether you're a beginner or looking to upskill, EDIFAI provides tools and content tailored for your growth.",
  },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="flex items-center justify-center mb-4">
          <FaRegQuestionCircle className="text-[#8A63FF] mr-2" size={20}/>
          <span className="bg-[#8A63FF] text-white px-4 py-2 rounded-2xl text-sm font-semibold">
            FAQS
          </span>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-mont font-medium text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4 w-full">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden transition-all ${
                openIndex === index
                  ? 'border-[#8A63FF] shadow-md shadow-purple-200'
                  : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left bg-white transition-colors"
              >
                <span className="text-base md:text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <span className="flex items-center justify-center w-8 h-8 text-[#8F8F8F] text-2xl">
                  {openIndex === index ? '-' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-6 py-4 text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
