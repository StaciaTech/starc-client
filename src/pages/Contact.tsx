import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import heros from "../Assets/hero.png";
import PurpleBox from "@/components/PurpleBox";
import WallOfLove from "../components/WallOfLove";
import contactProfie from "../Assets/sarabesh.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../lib/api";

// The email address where form submissions will be sent
const CONTACT_EMAIL = "contact@edifai.com";

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
      valid = false;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post("/api/contact", {
        ...formData,
        recipientEmail: CONTACT_EMAIL
      });
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
        toast.success("Your message has been sent successfully!");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      
      {/* Hero Section - Moved further up with reduced spacing */}
      <section className="relative overflow-hidden pt-16 pb-4">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgeT0iMSIgcj0iMSIgZmlsbD0iIzAwMDAwMDMzIi8+PC9zdmc+')] bg-repeat"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-full max-w-3xl mx-auto mb-2">
              {/* <img
                src={heros}
                alt="Hero"
                className="w-[60%] mx-auto"
              /> */}
            </div>
            
            <div className="max-w-2xl mx-auto">
              <span className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold bg-[#8A63FF] text-white rounded-full mb-2">
                EDIFAI COURSE
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Contact Us
              </h1>
              <p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
                Connect with the Edifai team for personalized assistance. Whether
                you have questions about our programs, need technical support, or want to explore
                partnership opportunities, we're here to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left: Contact Info */}
            <div className="w-full lg:w-1/2">
              <span>
                <p className="text-[#8A63FF] font-semibold text-sm sm:text-base mb-2">
                  Edifai
                </p>
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-black mb-4 sm:mb-6">
                Contact Us
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
                Have questions or need assistance with our courses? We're here to
                help you every step of the way. Reach out to us for any inquiries,
                and our team will be glad to provide the support you need promptly
                and efficiently.
              </p>

              <h3 className="text-lg sm:text-xl md:text-2xl font-mont text-gray-900 mb-4">
                How we can help
              </h3>

              <ul className="space-y-4 text-gray-700 pl-2 mb-8">
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8A63FF] flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-sm sm:text-base">Answer your course-related questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8A63FF] flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-sm sm:text-base">Provide technical support and troubleshooting</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8A63FF] flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-sm sm:text-base">Assist with enrollment and program details</span>
                </li>
              </ul>

              <div className="flex items-center gap-4 mb-8">
                <img
                  src={contactProfie}
                  alt="CEO Profile"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm sm:text-base font-medium">Name</p>
                  <p className="text-sm sm:text-base">
                    Mr Sarabesh Sriram, CEO at <span className="text-blue-500">Stacia</span>
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600">
                We are committed to ensuring your learning experience is smooth
                and successful. Our dedicated support staff is available to
                address all your concerns, providing timely and helpful solutions
                to help you thrive in your journey.
              </p>
            </div>

            {/* Right: Contact Form - Now Functional with Email Sending */}
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-6">Send us a message</h3>
                
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6">
                    <p>Thank you for your message! We'll get back to you soon.</p>
                    <button 
                      className="mt-3 text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md"
                      onClick={() => setSubmitSuccess(false)}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <Input 
                          id="name"
                          name="name"
                          placeholder="Your name" 
                          className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                          value={formData.name}
                          onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <Input 
                          id="email"
                          name="email"
                          type="email" 
                          placeholder="Your email" 
                          className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <Input 
                        id="subject"
                        name="subject"
                        placeholder="How can we help you?" 
                        className={`w-full ${errors.subject ? 'border-red-500' : ''}`}
                        value={formData.subject}
                        onChange={handleChange}
                      />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <Textarea 
                        id="message"
                        name="message"
                        placeholder="Your message here..." 
                        className={`w-full min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                        value={formData.message}
                        onChange={handleChange}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#8A63FF] hover:bg-[#7A53EF]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-1 border rounded-xl shadow-sm">
              <div className="bg-[#F7F8FA] p-6 rounded-xl text-center h-full">
                <div className="bg-white w-16 h-16 mx-auto p-4 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Message Us
                </h3>
                <p className="text-gray-600">
                  {CONTACT_EMAIL}
                </p>
              </div>
            </div>

            <div className="bg-white p-1 border rounded-xl shadow-sm">
              <div className="bg-[#F7F8FA] p-6 rounded-xl text-center h-full">
                <div className="bg-white w-16 h-16 mx-auto p-4 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Call Us!
                </h3>
                <p className="text-gray-600">
                  +91 936-303-4150
                </p>
              </div>
            </div>

            <div className="bg-white p-1 border rounded-xl shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="bg-[#F7F8FA] p-6 rounded-xl text-center h-full">
                <div className="bg-white w-16 h-16 mx-auto p-4 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Address
                </h3>
                <p className="text-gray-600">
                  Ground Floor, C-53, Guindy Industrial Estate, Chennai
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900 mb-4">
              Find Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit our office or reach out to us online. We're always happy to hear from you.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-md h-[300px] sm:h-[400px] lg:h-[500px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.4246883036!2d80.20613427482571!3d13.008857714490618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526787e0576281%3A0x7e54ef33cacc8b0!2sGuindy%20Industrial%20Estate%2C%20SIDCO%20Industrial%20Estate%2C%20Guindy%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1715436500000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <WallOfLove />
      
      {/* CTA Section */}
      <div className="py-12 sm:py-16 flex justify-center">
        <PurpleBox />
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
