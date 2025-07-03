import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star } from 'lucide-react';
import BookView from './BookView';

export interface Book {
  id: string;
  title: string;
  author: string;
  topic: string;
  coverImage: string;
  driveUrl: string;
  rating: number;
  pages: number;
  description?: string;
}

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);

  const openBookView = () => {
    setIsViewOpen(true);
  };

  const closeBookView = () => {
    setIsViewOpen(false);
  };

  return (
    <>
      <Card className="h-full hover:shadow-md transition-all duration-300">
        <div 
          className="relative h-48 overflow-hidden cursor-pointer" 
          onClick={openBookView}
        >
          {/* Book cover with minimal overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10"></div>
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-purple-600 text-white py-0.5 px-2 rounded-full text-xs font-medium z-20">
            {book.topic}
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium text-base text-gray-900 mb-1 line-clamp-1">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            by {book.author}
          </p>
          <div className="flex items-center text-xs">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={`${i < Math.floor(book.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-gray-500">({book.rating.toFixed(1)})</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            variant="default" 
            className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white w-full text-sm h-8"
            onClick={openBookView}
          >
            <BookOpen size={14} className="mr-1" /> Read
          </Button>
        </CardFooter>
      </Card>

      {isViewOpen && (
        <BookView 
          driveUrl={book.driveUrl} 
          title={book.title} 
          onClose={closeBookView} 
        />
      )}
    </>
  );
};

export default BookCard; 