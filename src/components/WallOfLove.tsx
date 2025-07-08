import React from 'react';
import vector from "../Assets/Vector.svg";
import WOLImage1 from '../Assets/icons/WOLImage1.svg';
import WOLImage2 from '../Assets/icons/WOLImage2.svg';
import WOLImage3 from '../Assets/icons/WOLImage3.svg';
import WOLImage4 from '../Assets/icons/WOLImage4.svg';
import WOLImage5 from '../Assets/icons/WOLImage5.svg';
import WOLImage6 from '../Assets/icons/WOLImage6.svg';
import { cn } from "@/lib/utils";

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
    content: 'This platform has transformed my learning experience! The courses are engaging. Highly recommend to everyone.',
    image: WOLImage1
  },
  {
    id: 2,
    name: 'Leslie Alexander',
    role: "UI/UX Designer",
    date: " 10:02 AM · Jun 15",
    content: 'Absolutely brilliant! The content is so well-structured and easy to follow. I have gained valuable skills in a short time.',
    image: WOLImage2
  },
  {
    id: 3,
    name: 'Wade Warren',
    role: "Developer",
    date: " 1:15 PM · Jun 15",
    content: 'Incredible community and top-notch instructors. I feel so much more confident in my career path now. A true game-changer!',
    image: WOLImage3
  },
  {
    id: 4,
    name: 'Jacob Jones',
    role: "Mechanical",
    date: " 12:18 PM · Sep 10",
    content: 'The interactive lessons and practical exercises truly set this platform apart. I am seeing real progress every day.',
    image: WOLImage4
  },
  {
    id: 5,
    name: 'Courtney Henry',
    role: "Human Resource",
    date: " 2:15 PM · Nov 24",
    content: 'The interactive lessons and practical exercises truly set this platform apart. I am seeing real progress every day.',
    image: WOLImage5
  },
  {
    id: 6,
    name: 'Darrell Steward',
    role: "Designer",
    date: " 03:55 PM · Dec 10",
    content: 'Fantastic resources and a truly supportive environment. I have learned more here than I ever thought possible.',
    image: WOLImage6
  },
];

const createRepeatedArray = (items: TestimonialCardProps[], count: number) => {
  const result: TestimonialCardProps[] = [];
  for (let i = 0; i < count; i++) {
    items.forEach((item) => {
      result.push({ ...item, id: item.id + i * items.length * 100 });
    });
  }
  return result;
};

// Optimized repetition count for performance
const firstRow = createRepeatedArray(testimonials.slice(0, 2), 100);
const secondRow = createRepeatedArray(testimonials.slice(2, 4), 100);
const thirdRow = createRepeatedArray(testimonials.slice(4, 6), 100);
const fourthRow = createRepeatedArray([testimonials[0], testimonials[3]], 100);

const ReviewCard = ({ img, name, role, content, date }: { img: string; name: string; role: string; content: string; date: string; }) => {
  return (
    <figure
      className={cn(
        "relative w-full max-w-[300px] cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-200 bg-white hover:bg-gray-100",
        "dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700",
        "shadow-sm hover:shadow-md transition-all duration-300 min-h-[120px]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full w-8 h-8" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">{name}</figcaption>
          <p className="text-xs font-medium dark:text-white/60">{role}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-gray-800 dark:text-white/80 line-clamp-3">{content}</blockquote>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{date}</p>
    </figure>
  );
};

const VerticalMarquee = ({ reviews, duration, reverse = false }: { reviews: TestimonialCardProps[]; duration: string; reverse?: boolean }) => {
  return (
    <div className="overflow-hidden h-[360px] sm:h-[400px] md:h-[480px] lg:h-[600px] relative group w-full max-w-[300px]">
      <div
        className={cn(
          "flex flex-col absolute w-full gap-3 sm:gap-4",
          reverse ? "animate-marquee-vertical-reverse" : "animate-marquee-vertical",
          "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: duration }}
      >
        {[...reviews, ...reviews].map((review, index) => (
          <ReviewCard
            key={`${review.id}-${index}`}
            img={review.image}
            name={review.name}
            role={review.role}
            content={review.content}
            date={review.date}
          />
        ))}
      </div>
    </div>
  );
};

const WallOfLove: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-black">
      <style>
        {`
          @keyframes marquee-vertical {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes marquee-vertical-reverse {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          .animate-marquee-vertical {
            animation: marquee-vertical linear infinite;
          }
          .animate-marquee-vertical-reverse {
            animation: marquee-vertical-reverse linear infinite;
          }
        `}
      </style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Wall of Love
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See what our students and community members are saying about their experience with Edifai.
          </p>
        </div>

        <div className="relative w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-start justify-center overflow-hidden h-[360px] sm:h-[400px] md:h-[480px] lg:h-[600px]">
          <VerticalMarquee reviews={firstRow} duration="500s" />
          <VerticalMarquee reviews={secondRow} duration="500s" reverse />
          <div className="hidden md:block">
            <VerticalMarquee reviews={thirdRow} duration="500s" />
          </div>
          <div className="hidden lg:block">
            <VerticalMarquee reviews={fourthRow} duration="500s" reverse />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WallOfLove;



// import React from 'react';
// import vector from "../Assets/Vector.svg";
// import WOLImage1 from '../Assets/icons/WOLImage1.svg';
// import WOLImage2 from '../Assets/icons/WOLImage2.svg';
// import WOLImage3 from '../Assets/icons/WOLImage3.svg';
// import WOLImage4 from '../Assets/icons/WOLImage4.svg';
// import WOLImage5 from '../Assets/icons/WOLImage5.svg';
// import WOLImage6 from '../Assets/icons/WOLImage6.svg';
// import WOLtwitterLogo from '../Assets/icons/WOLtwitterLogo.svg';
// import { cn } from "@/lib/utils";

// interface TestimonialCardProps {
//   id: number;
//   name: string;
//   role: string;
//   date: string;
//   content: string;
//   image: string;
// }

// const testimonials: TestimonialCardProps[] = [
//   {
//     id: 1,
//     name: 'Esther Howard',
//     role: "Developer",
//     date: "12:15 PM · May 19, 2024",
//     content: 'This platform has transformed my learning experience! The courses are engaging. Highly recommend to everyone.',
//     image: WOLImage1
//   },
//   {
//     id: 2,
//     name: 'Leslie Alexander',
//     role: "UI/UX Designer",
//     date: "10:02 AM · June 15, 2024",
//     content: 'Absolutely brilliant! The content is so well-structured and easy to follow. I have gained so many valuable skills in such a short time.',
//     image: WOLImage2
//   },
//   {
//     id: 3,
//     name: 'Wade Warren',
//     role: "Developer",
//     date: "1:15 PM · June 15, 2024",
//     content: 'Incredible community and top-notch instructors. I feel so much more confident in my career path now.',
//     image: WOLImage3
//   },
//   {
//     id: 4,
//     name: 'Jacob Jones',
//     role: "Mechanical",
//     date: "12:18 PM · September 10, 2024",
//     content: 'The interactive lessons and practical exercises truly set this platform apart. I am seeing real progress every single day.',
//     image: WOLImage4
//   },
//   {
//     id: 5,
//     name: 'Courtney Henry',
//     role: "Human Resource",
//     date: "2:15 PM · November 24, 2024",
//     content: 'The interactive lessons and practical exercises truly set this platform apart. I am seeing real progress every single day.',
//     image: WOLImage5
//   },
//   {
//     id: 6,
//     name: 'Darrell Steward',
//     role: "Designer",
//     date: "03:55 PM · December 10, 2024",
//     content: 'Fantastic resources and a truly supportive environment. I have learned more here than I ever thought possible.',
//     image: WOLImage6
//   },
// ];

// const WallOfLove: React.FC = () => {
//   return (
//     <section className="flex justify-center items-center w-full mt-5 lg:h-[700px] xl:h-[800px] 2xl:h-[900px] 3xl:h-[800px] bg-white dark:bg-black">
//       <div className="flex flex-col items-center lg:w-[90%] lg:h-[90%] xl:w-[90%] xl:h-[90%] 2xl:w-[90%] 2xl:h-[90%] 3xl:w-[90%] 3xl:h-[90%] mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl md:text-4xl lg:text-6xl font-mont font-semibold text-gray-900 dark:text-white mb-4">Wall of Love</h2>
//           <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//             See what our students and community members are saying about their experience with Edifai.
//           </p>
//         </div>
//         <div className="flex flex-wrap justify-around lg:w-[80%] lg:h-[75%] xl:w-[80%] xl:h-[75%] 2xl:w-[80%] 2xl:h-[75%] 3xl:w-[75%] 3xl:h-[70%]">
//           {testimonials.map((testimonial) => (
//             <div
//               key={testimonial.id}
//               className={cn(
//                 "flex flex-col justify-between 3xl:gap-4 bg-white dark:bg-gray-800 lg:h-[45%] lg:w-[32%] xl:h-[45%] xl:w-[32%] 2xl:h-[45%] 2xl:w-[32%] 3xl:h-[45%] 3xl:w-[32%] border border-[#8A63FF] p-6 rounded-2xl",
//                 "shadow-sm hover:shadow-md transition-all duration-300"
//               )}
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center">
//                   <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
//                     <img src={testimonial.image} alt={testimonial.name} className="rounded-full" />
//                   </div>
//                   <div className="flex flex-col">
//                     <p className="font-semibold text-black dark:text-white">{testimonial.name}</p>
//                     <span className="text-[#82828299] text-sm">{testimonial.role}</span>
//                   </div>
//                 </div>
//                 {/* <img src={WOLtwitterLogo} alt="Twitter Logo" className="w-6 h-6 text-blue-400" /> */}
//               </div>
//               <p className="text-black dark:text-white/80 font-mont font-medium leading-relaxed lg:text-xs xl:text-sm 2xl:text-[16px] 3xl:text-[16px] flex-grow mb-4">{testimonial.content}</p>
//               <p className="lg:text-[10px] xl:text-xs text-sm text-gray-500 dark:text-gray-400 font-mont font-medium">{testimonial.date}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WallOfLove;