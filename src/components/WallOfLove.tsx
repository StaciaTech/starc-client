// src/App.tsx
import React from 'react';
import vector from "../Assets/Vector.svg";
import WOLImage1 from '../Assets/icons/WOLImage1.svg'
import WOLImage2 from '../Assets/icons/WOLImage2.svg'
import WOLImage3 from '../Assets/icons/WOLImage3.svg'
import WOLImage4 from '../Assets/icons/WOLImage4.svg'
import WOLImage5 from '../Assets/icons/WOLImage5.svg'
import WOLImage6 from '../Assets/icons/WOLImage6.svg'
import WOLtwitterLogo from '../Assets/icons/WOLtwitterLogo.svg'
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

// --- TestimonialCard Component ---
interface TestimonialCardProps {
  id: number;
  name: string;
  role: string;
  date: string;
  content: string;
  image: string;
}

const testimonials: TestimonialCardProps[] = [
  {
    id: 1,
    name: 'Esther Howard',
    role: "Developer",
    date: " 12:15 PM · May 19",
    content:
      'This platform has transformed my learning experience! The courses are engaging. Highly recommend to everyone.',
    image: WOLImage1
  },
  {
    id: 2,
    name: 'Leslie Alexander',
    role: "UI/UX Designer",
    date: " 10:02 AM · Jun 15",
    content:
      'Absolutely brilliant! The content is so well-structured and easy to follow. I have gained valuable skills in a short time.',
    image: WOLImage2
  },
  {
    id: 3,
    name: 'Wade Warren',
    role: "Developer",
    date: " 1:15 PM · Jun 15",
    content:
      'Incredible community and top-notch instructors. I feel so much more confident in my career path now. A true game-changer!',
    image: WOLImage3
  },
  {
    id: 4,
    name: 'Jacob Jones',
    role: "Mechanical",
    date: " 12:18 PM · Sep 10",
    content:
      'The interactive lessons and practical exercises truly set this platform apart. I am seeing real progress every day.',
    image: WOLImage4
  },
  {
    id: 5,
    name: 'Courtney Henry',
    role: "Human Resource",
    date: " 2:15 PM · Nov 24",
    content:
      'The interactive lessons and practical exercises truly set this platform apart. I am seeing real progress every day.',
    image: WOLImage5
  },
  {
    id: 6,
    name: 'Darrell Steward',
    role: "Designer",
    date: " 03:55 PM · Dec 10",
    content:
      'Fantastic resources and a truly supportive environment. I have learned more here than I ever thought possible.',
    image: WOLImage6
  },
];

// Create rows with duplicated testimonials to prevent stuttering
const createRepeatedArray = (items: TestimonialCardProps[], count: number) => {
  const result: TestimonialCardProps[] = [];
  for (let i = 0; i < count; i++) {
    items.forEach((item) => {
      result.push({
        ...item,
        id: item.id + (i * items.length * 100) // Create unique IDs for React keys
      });
    });
  }
  return result;
};

// Create rows with 5 repetitions of each set to ensure smooth animation
const firstRow = createRepeatedArray(testimonials.slice(0, 2), 5);
const secondRow = createRepeatedArray(testimonials.slice(2, 4), 5);
const thirdRow = createRepeatedArray(testimonials.slice(4, 6), 5);
const fourthRow = createRepeatedArray([testimonials[0], testimonials[3]], 5);

const ReviewCard = ({
  img,
  name,
  role,
  content,
  date,
}: {
  img: string;
  name: string;
  role: string;
  content: string;
  date: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-fit sm:w-64 cursor-pointer overflow-hidden rounded-xl border p-4 mb-8",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        // shadow and transition
        "shadow-sm hover:shadow-md transition-all duration-300"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{role}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{content}</blockquote>
      <p className="mt-2 text-xs text-gray-500">{date}</p>
    </figure>
  );
};

const WallOfLove: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-mont font-medium text-gray-900 mb-4">
            Wall of Love
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our students and community members are saying about their experience with Edifai.
          </p>
        </div>

        <div className="relative flex h-[600px] w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
          <div
            className="flex flex-row items-center gap-6"
            style={{
              transform:
                "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
            }}
          >
            <Marquee pauseOnHover vertical className="[--duration:40s]">
              {firstRow.map((review) => (
                <ReviewCard key={review.id} img={review.image} name={review.name} role={review.role} content={review.content} date={review.date} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:45s]" vertical>
              {secondRow.map((review) => (
                <ReviewCard key={review.id} img={review.image} name={review.name} role={review.role} content={review.content} date={review.date} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:50s]" vertical>
              {thirdRow.map((review) => (
                <ReviewCard key={review.id} img={review.image} name={review.name} role={review.role} content={review.content} date={review.date} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:42s]" vertical>
              {fourthRow.map((review) => (
                <ReviewCard key={review.id} img={review.image} name={review.name} role={review.role} content={review.content} date={review.date} />
              ))}
            </Marquee>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white"></div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white"></div>
        </div>
      </div>
    </section>
  );
};

export default WallOfLove;