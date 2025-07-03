import icon from "../Assets/EDIFAI-1.svg";
import { IoLogoFacebook } from "react-icons/io";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const toNavigation = useNavigate();
  
  return (
    <footer className="bg-white py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-4">
          {/* Company info section */}
          <div className="w-full md:w-1/3 lg:w-[35%]">
            <div className="cursor-pointer mb-4">
              <img 
                src={icon} 
                className="w-[8rem]" 
                alt="EDIFAI Logo" 
                onClick={() => toNavigation('/')} 
              />
            </div>
            <div className="space-y-3 text-sm sm:text-base">
              <p className="text-black-600 font-mont">
                <span className="font-semibold">Corporate Head Office:</span>{" "}
                <span className="block mt-1 md:inline md:mt-0">
                  Ground Floor, C-53, Guindy Industrial Estate, Guindy, Chennai - 32, Tamil Nadu
                </span>
              </p>
              
              <p className="text-black-600 font-mont">
                <span className="font-semibold">Phone:</span>{" "}
                <span>+91-936-303-4150</span>
              </p>
            
              <p className="text-black-600 font-mont">
                <span className="font-semibold">Email:</span>{" "}
                <span>contactus@staciacorp.com</span>
              </p>
            </div>
          </div>

          {/* Links sections */}
          <div className="w-full md:w-2/3 lg:w-[65%] grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-4">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-mont font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li onClick={() => toNavigation('/')}>
                  <p className="font-mont hover:text-gray-900 transition-colors cursor-pointer">
                    Home
                  </p>
                </li>
                <li onClick={() => toNavigation('/course')}>
                  <p className="font-mont hover:text-gray-900 transition-colors cursor-pointer">
                    Courses
                  </p>
                </li>
                <li onClick={() => toNavigation('/book')}>
                  <p className="font-mont hover:text-gray-900 transition-colors cursor-pointer">
                    Books
                  </p>
                </li>
                <li onClick={() => toNavigation('/about')}>
                  <p className="font-mont hover:text-gray-900 transition-colors cursor-pointer">
                    About Us
                  </p>
                </li>
                <li onClick={() => toNavigation('/contact')}>
                  <p className="font-mont hover:text-gray-900 transition-colors cursor-pointer">
                    Contact Us
                  </p>
                </li>
              </ul>
            </div>
            
            {/* Others */}
            <div>
              <h3 className="text-lg font-mont font-bold mb-4">Others</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li>
                  <a
                    href="https://staciacorp.com/products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mont hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="https://staciacorp.com/services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mont hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="https://staciacorp.com/project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mont hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Projects
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-lg font-mont font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li>
                  <a
                    href="https://staciacorp.com/article"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mont hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Article
                  </a>
                </li>
                <li>
                  <a
                    href="https://staciacorp.com/career"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mont hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Career
                  </a>
                </li>  
                <li>
                  <a
                    href="https://staciacorp.com/case-study"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mont hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Case Study
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright and social links */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-600 gap-4">
          <p className="text-sm">&copy; 2025 All rights reserved</p>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/company/staciacorp/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-6 h-6 text-gray-900 hover:text-[#8A63FF] transition-colors" />
            </a>
            <a 
              href="https://x.com/StaciaCorp" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaSquareXTwitter className="w-6 h-6 text-gray-900 hover:text-[#8A63FF] transition-colors" />
            </a>
            <a
              href="https://www.facebook.com/staciacorp/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <IoLogoFacebook className="w-6 h-6 text-gray-900 hover:text-[#8A63FF] transition-colors" />
            </a>
            <a
              href="https://www.instagram.com/stacia_corp_?igsh=MTA5MGdnZms5ZjhwMA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagramSquare className="w-6 h-6 text-gray-900 hover:text-[#8A63FF] transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;