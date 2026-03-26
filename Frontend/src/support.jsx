import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SendIcon from '@mui/icons-material/Send';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { getBackendUrl } from '@/config/env';

// --- FIX ---
// The '/contact' path must be passed *into* the function,
// not concatenated after calling it with no arguments.
const YOUR_BACKEND_API_URL = getBackendUrl('/contact');

const faqData = [
  {
    question: 'What is the purpose of this AI Governance platform?',
    answer: 'Our platform provides a centralized system for monitoring, managing, and ensuring compliance of all artificial intelligence models within your organization. It helps track model performance, mitigate risks, and maintain ethical AI standards.'
  },
  {
    question: 'How do I register a new AI model?',
    answer: 'To register a new model, navigate to the "Model Registry" section from the main dashboard. Click on "Add New Model" and follow the on-screen prompts to provide model details, documentation, and risk assessments.'
  },
  {
    question: 'Can I set up automated compliance checks?',
    answer: 'Yes. In the "Compliance Policies" section, you can define custom rules and thresholds. Once a policy is active, the platform will automatically monitor linked models and flag any deviations, sending alerts to the designated stakeholders.'
  },
  {
    question: 'Who can I contact for urgent technical support?',
    answer: 'For urgent issues, please use the contact form below and select "Urgent" as the inquiry type. Our premium support plan offers a 24/7 hotline, the details of which can be found in your service level agreement (SLA).'
  },
  {
    question: 'How is data privacy handled on the platform?',
    answer: 'We adhere to strict data privacy regulations, including GDPR and CCPA. All data is encrypted both in transit and at rest. The platform allows you to set granular access controls to ensure that sensitive information is only accessible to authorized personnel.'
  },
];

// --- FAQ Item Component (Accordion Style) ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-slate-800 dark:text-slate-200 py-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ExpandMoreIcon className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <p className="pb-4 text-slate-600 dark:text-slate-400">
              {answer}
            </p>
        </div>
      </div>
    </div>
  );
};


// --- Main Support Page Component ---
export default function App() {
  const [formStatus, setFormStatus] = useState('');
  const [formError, setFormError] = useState('');
  
  // --- UPDATED with Axios ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError('');

    // Get form data
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      inquiryType: e.target['inquiry-type'].value,
      message: e.target.message.value,
    };

    try {
      // Use axios.post - it automatically stringifies JSON
      // and throws an error for non-2xx status codes.
      await axios.post(YOUR_BACKEND_API_URL, formData);

      // Success
      setFormStatus('success');
      e.target.reset();
      setTimeout(() => setFormStatus(''), 3000);

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Get error message from backend response if it exists
      const message = error.response?.data?.message 
                      || error.message 
                      || "Failed to send message. Please try again.";

      setFormError(message);
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 5000); // Give more time to read error
    }
  };
    
  // Reusable classes for form elements
  const inputClasses = "w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950 transition-colors";

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        {/* --- Header Section --- */}
        <header className="text-center mb-12">
            <div className="inline-block bg-blue-100 dark:bg-blue-950/50 p-3 rounded-full mb-4">
                <SupportAgentIcon className="w-10 h-10 text-blue-600 dark:text-blue-400"/>
            </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Support Center
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            We're here to help. Find answers to your questions, contact our team, or explore our documentation.
          </p>
        </header>

        {/* --- Search Bar --- */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="search"
              placeholder="Search for help articles..."
              className="w-full p-4 pl-12 text-lg border border-slate-300 dark:border-slate-700 rounded-full bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* --- Left Column (FAQs & Docs) --- */}
            <div className="lg:col-span-2">
                {/* --- FAQs Section --- */}
                <section id="faq">
                  <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    {faqData.map((item, index) => (
                      <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))}
                  </div>
                </section>

                {/* --- Documentation Link --- */}
                <section className="mt-12">
                     <h2 className="text-3xl font-bold mb-6">Need More Details?</h2>
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200 dark:border-slate-800">
                         <div>
                            <h3 className="text-xl font-bold">Explore Our Documentation</h3>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Get in-depth guides and technical references.</p>
                         </div>
                         <a
                            href="#"
                            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                         >
                            <MenuBookIcon className="w-5 h-5"/>
                            <span>View Docs</span>
                        </a>
                     </div>
                </section>
            </div>

            {/* --- Right Column (Contact Form) --- */}
            <aside id="contact">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm sticky top-10 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-1">
                    <MailOutlineIcon className="w-6 h-6 text-slate-700 dark:text-slate-300"/>
                    <h2 className="text-2xl font-bold">Contact Support</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Can't find an answer? Let us know.</p>
                <form onSubmit={handleFormSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                      <input type="text" id="name" required className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                      <input type="email" id="email" required className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="inquiry-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Inquiry Type</label>
                      <select id="inquiry-type" className={inputClasses}>
                        <option>General Question</option>
                        <option>Technical Issue</option>
                        <option>Billing Inquiry</option>
                        <option>Feature Request</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                      <textarea id="message" rows="5" required className={`${inputClasses} min-h-[100px]`}></textarea>
                    </div>
                    <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={formStatus === 'sending'}
                    >
                        <SendIcon className="w-5 h-5"/>
                        <span>{formStatus === 'sending' ? 'Sending...' : 'Send Message'}</span>
                    </button>
                    {formStatus === 'success' && (
                        <p className="text-center text-sm text-green-600 dark:text-green-400 mt-4">
                            Message sent! We'll be in touch shortly.
                        </p>
                    )}
                    {formStatus === 'error' && (
                         <p className="text-center text-sm text-red-600 dark:text-red-400 mt-4">
                            {formError || 'An unknown error occurred.'}
                        </p>
                    )}
                  </div>
                </form>
              </div>
            </aside>
        </div>

      </div>
    </div>
  );
}

