import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Book as BookIcon, BookOpen, ChevronRight, Search } from "lucide-react";
import BookCard, { type Book as BookType } from "@/components/BookCard";
import heroimage from "../Assets/Vector.png"; // Import the same hero image used in Course page

const Book: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Books data with Google Drive URLs
  const books: BookType[] = [
    {
      id: "1",
      title: "STARC Full Stack Development Book",
      author: "STARC Learning Team",
      topic: "Full Stack",
      coverImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=400&fit=crop",
      driveUrl: "https://drive.google.com/file/d/1qKlORe2GuOlmxVuTGF1Ac1qQrzbbHQhf/view?usp=sharing",
      rating: 4.9,
      pages: 412,
      description: "Comprehensive guide to full stack web development covering frontend and backend technologies."
    },
    {
      id: "2",
      title: "The Ultimate Self-Learning Guide to Autodesk Fusion 360",
      author: "Design Engineering Team",
      topic: "3D Design",
      coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=400&fit=crop",
      driveUrl: "https://docs.google.com/document/d/16cO2mnQiksjODlgMq5GCXjNsK3wSpxmWhN9OJ9SgbRE/edit?usp=sharing",
      rating: 4.8,
      pages: 325,
      description: "Learn Autodesk Fusion 360 from scratch with this comprehensive self-learning guide."
    }
  ];

  // Filter books by search term
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Exactly matching the Course page */}
      <section className="relative bottom-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col justify-center items-center">
            <img
              src={heroimage}
              alt="Hero Image"
              className="mx-auto"
              style={{
                width: "500px",
                height: "auto",
                position: "relative",
                left: "0",
                top: "90px",
                transform: "ScaleX(-1)"
              }}
            />
            <div className="">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
                Discover Our Edifai Books
              </h1>
              <p className="text-[14px] text-gray-600 max-w-3xl mx-auto mb-8">
                Discover thousands of books taught by expert instructors.
                Start learning today and advance your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Search Section */}
      <section className="bg-white py-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 w-full h-auto">
            <h2 className="text-2xl font-semibold mb-6">Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Search:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search in books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-full border border-[#00000040] px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <Search
                    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  className="w-full rounded-full border border-[#00000040] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  <option>Latest</option>
                  <option>Most Popular</option>
                  <option>Highest Rated</option>
                  <option>Newest</option>
                </select>
              </div>
              
              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Topic:
                </label>
                <select
                  id="topic"
                  className="w-full rounded-full border border-[#00000040] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  <option>All Topics</option>
                  <option>Full Stack</option>
                  <option>3D Design</option>
                  <option>Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Available Books {filteredBooks.length > 0 && `(${filteredBooks.length})`}
                </h2>
              </div>
              
              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                  <BookIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-xl font-bold mb-3">Want more learning resources?</h2>
          <p className="text-gray-700 mb-5">
            Our collection is constantly growing. Check back regularly for new books and educational materials.
          </p>
          <Button className="bg-[#8A63FF] hover:bg-[#7A53EF]">
            Contact STARC Team
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Book;
