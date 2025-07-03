import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Globe, Heart, Lightbulb } from "lucide-react";
import WallOfLove from "@/components/WallOfLove";
import PurpleBox from "@/components/PurpleBox";
import TeamShip from "@/components/TeamShip";
import StarcTeam from "@/components/StarcTeam";
import woman from "../Assets/woman.png";
import world from "../Assets/world.png";
import trust from "../Assets/trust.png";
import award from "../Assets/award.png";
import positive from "../Assets/positive.png";
import indus from "../Assets/indus.png";
import stay from "../Assets/stay.svg";
import promote from "../Assets/promote.svg";
import foster from "../Assets/foster.svg";
import provide from "../Assets/provide.svg";
import group from "../Assets/Group.svg";

const About = () => {
  const stats = [
    { number: "500+", label: "Students" },
    {
      number: "1M+",
      label: "A modest number to start off the metrics section ",
    },
    {
      number: "94%",
      label: "A modest number to start off the metrics section",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      {/* <section className="bg-gradient-to-br from-purple-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                About
                <span className="text-purple-600"> Nexora</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're on a mission to democratize education and make high-quality learning accessible to everyone, everywhere. Since 2020, we've been helping millions of students achieve their dreams through innovative online education.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl">
                Join Our Mission
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Our Values Section (custom design) */}
      <section className="relative overflow-hidden flex justify-center px-4 sm:px-8 md:px-12 lg:px-20 py-12 sm:py-16 md:py-20 lg:py-24 w-full">
        <div className="flex flex-col md:flex-row lg:w-[900px] lg:h-[475px] xl:w-[1100px] xl:h-[575px] 2xl:w-[1400px] 2xl:h-[675px] 3xl:h-[775px] 3xl:w-[1565px]">
          {/* Left:Text Content--*/}
          <div
            className="w-full md:w-1/2 flex flex-col justify-start items-start mb-8 md:mb-0"
            style={{
              fontFamily: "mont-regular",
            }}
          >
            <div className="flex flex-col justify-start w-full sm:w-[90%] md:w-[80%]">
              <span className="text-[#8A63FF] text-base sm:text-lg w-full flex font-semibold font-mont mb-2 sm:mb-4">
                Our Values
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-xl xl:text-3xl 2xl:text-5xl font-mont font-semibold xl:py-1 text-black-900 mb-2 sm:mb-4 leading-snug">
                Our team shares <br /> values to{" "}
                <span className="text-[#8A63FF]">Success</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-sm xl:text-lg 2xl:text-xl mt-2 sm:mt-4">
                At Edifai, we are driven by a commitment to excellence,
                integrity, and continuous improvement.
              </p>
              <ul className="space-y-3 sm:space-y-6 text-sm sm:text-base lg:text-[12px] 2xl:text-xl pt-3 sm:pt-5 w-full">
                <li className="flex items-center gap-2 sm:gap-4">
                  <span className="inline-flex items-center justify-center w-4 h-4 3xl:w-6 3xl:h-6 rounded-full bg-[#8A63FF]">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                  <span className="text-black font-mont">
                    Learn today, lead tomorrow
                  </span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center justify-center w-4 h-4 3xl:w-6 3xl:h-6 rounded-full bg-[#8A63FF]">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                  <span className="text-black font-mont">
                    Inform your customers about your features
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/*--Right: Responsive Image Container--*/}
          <div className="w-full md:w-1/2 relative flex justify-center items-center">
            <div className="relative w-full aspect-[16/10]">
              {/* Main Image */}
              <div className="flex justify-center md:justify-start">
                <img
                  src={woman}
                  alt="Team"
                  className="w-[220px] h-[150px] sm:w-[250px] sm:h-[170px] lg:w-[290px] lg:h-[179px] xl:w-[330px] xl:h-[199px] 2xl:w-[454px] 2xl:h-[284px] 3xl:w-[584px] 3xl:h-[364px] rounded-xl shadow-lg z-10"
                />

                {/* Overlapping Image */}
                <img
                  src={woman}
                  alt="Team 2"
                  className="absolute w-[180px] h-[120px] sm:w-[200px] sm:h-[140px] lg:w-[220px] lg:h-[149px] top-[30%] left-[25%] sm:top-[30%] sm:left-[25%] lg:top-[35%] lg:left-[25%] xl:w-[250px] xl:h-[160px] xl:top-[30%] xl:left-[25%] 2xl:top-[35%] 2xl:left-[25%] 2xl:h-[200px] 2xl:w-[328px] 3xl:top-[40%] 3xl:left-[28%] 3xl:h-[245px] 3xl:w-[428px] rounded-xl shadow-lg border-4 border-white z-20"
                />
              </div>
            </div>
          </div>
          <img
            src={world}
            alt="World Map"
            className="absolute w-[80%] sm:w-[70%] md:w-[65%] lg:w-[55%] top-[40%] sm:top-[35%] md:top-[30%] left-[10%] sm:left-[20%] md:left-[25%] lg:left-[35%] xl:w-[60%] xl:left-[32%] 2xl:w-[60%] 2xl:top-[22%] 2xl:left-[30%] 3xl:top-[25%] 3xl:left-[30%] 3xl:w-[60%] h-full object-contain z-0"
          />
        </div>
      </section>

      {/* Learn Today, Lead Tomorrow Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white flex justify-center">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:w-[1100px] xl:w-[1000px] 2xl:w-[1400px] 3xl:w-[1565px] flex flex-col md:flex-row justify-center">
          {/* Left: Text Content */}
          <div className="w-full md:w-1/2 lg:w-[500px] xl:w-[600px] 2xl:w-[726px] 3xl:w-[900px] pt-5 sm:pt-10 px-4 sm:px-8 md:px-12 lg:pl-20 mb-8 md:mb-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl w-full sm:w-[90%] md:w-[80%] font-mont font-medium text-gray-900 mb-6 sm:mb-8 leading-tight">
              "Learn today, lead tomorrow"
            </h2>
            
            <div className="flex justify-between w-full sm:w-[90%] md:w-[80%] lg:w-[80%] xl:w-[80%] 2xl:w-[50%] 3xl:w-[90%]">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl font-mont font-bold bg-gradient-to-b from-[#6E51E0] to-[#8A63FFB2] bg-clip-text text-transparent">
                  200+
                </div>
                <div className="text-black text-sm sm:text-base font-semibold 3xl:p-2">People</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl font-mont font-bold bg-gradient-to-b from-[#6E51E0] to-[#8A63FFB2] bg-clip-text text-transparent">
                  50+
                </div>
                <div className="text-black text-sm sm:text-base font-semibold 3xl:p-2">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl font-mont font-bold bg-gradient-to-b from-[#6E51E0] to-[#8A63FFB2] bg-clip-text text-transparent">
                  20+
                </div>
                <div className="text-black text-sm sm:text-base font-semibold 3xl:p-2">
                  Experience Staff
                </div>
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="w-full md:w-1/2 lg:w-[500px] xl:w-[300px] 2xl:w-[706px] 3xl:w-[706px] px-4 sm:px-8 md:px-10">
            <div className="w-[150px] sm:w-[203px]">
              <span className="text-2xl sm:text-3xl text-[#8A63FF] font-mont font-bold mb-2 sm:mb-4 flex justify-between">
                Edifai
              </span>
            </div>
            <p
              className="text-base sm:text-lg text-gray-900 font-mont leading-relaxed"
              style={{
                fontFamily: "mont-regular",
              }}
            >
              At Edifai, we empower individuals with cutting-edge knowledge and
              practical skills. Our diverse course offerings are meticulously
              designed to equip you for the challenges and opportunities of
              tomorrow's landscape. We believe in fostering a dynamic learning
              environment where innovation thrives, and every student is
              encouraged to reach their full potential. Join our vibrant
              community and become part of a network committed to continuous
              growth and success.
            </p>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 md:py-20 flex justify-center bg-white w-full">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:w-[900px] xl:w-[1000px] 2xl:w-[1200px] 3xl:w-[1596px]">
          <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-mont font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4 xl:text-[30px] 2xl:text-[30px] 3xl:text-[40px]"
              style={{
                fontFamily: "mont-regular",
              }}
            >
              Achievements
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 pr-0 sm:pr-12 md:pr-24 lg:pr-48 3xl:text-xl 2xl:text-sm xl:text-[10px] lg:text-[10px]">
              Our commitment to excellence has led us to achieve significant
              milestones along our journey. Here are some of our notable
              achievements:
            </p>
          </div>

          <div className="flex flex-col md:flex-row flex-wrap 3xl:p-10 2xl:p-10">
            {/* left side */}
            <div className="w-full md:w-1/2 space-y-8 sm:space-y-10 mb-5">
              <div className="flex flex-col space-y-3 sm:space-y-4 items-start 3xl:w-[683px] 2xl:w-[400px]">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl 3xl:mb-5 flex items-center justify-center flex-shrink-0">
                  <img src={trust} alt="Trust icon" />
                </div>
                <div>
                  <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                    Trusted by Thousands
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                    Our platform has earned the confidence of a vast and growing
                    community of learners worldwide, a testament to our quality
                    and reliability.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-3 sm:space-y-4 3xl:w-[683px] 2xl:w-[400px]">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl 3xl:mb-5 flex items-center justify-center flex-shrink-0">
                  <img src={award} alt="Award icon" />
                </div>
                <div>
                  <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                    Award-Winning Courses
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                    Recognized for their exceptional content and innovative
                    teaching methodologies.
                  </p>
                </div>
              </div>
            </div>

            {/* right side */}
            <div className="w-full md:w-1/2 space-y-8 sm:space-y-10">
              <div className="flex flex-col space-y-3 sm:space-y-4 items-start 3xl:w-[683px] 2xl:w-[400px]">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl 3xl:mb-5 flex items-center justify-center flex-shrink-0">
                  <img src={positive} alt="Positive icon" />
                </div>
                <div>
                  <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                    Positive Student Feedback
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                    Consistently receiving high praise, our students commend us
                    for our effective instruction.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-3 sm:space-y-4 3xl:mb-5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img src={indus} alt="Industry icon" />
                </div>
                <div>
                  <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                    Industry Partnerships
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                    We collaborate with leading companies and organizations,
                    ensuring our curriculum remains cutting-edge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section--- */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="w-[90%] sm:w-[80%] md:w-[70%] mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 md:gap-10 bg-white p-4 sm:p-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center w-full sm:w-1/3">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-mont font-medium text-center text-[#6E51E0] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm sm:text-base text-center text-wrap font-mont">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <TeamShip />
      </section>

      {/* Our Goals Section */}
      <section className="py-12 sm:py-16 md:py-20 flex justify-center bg-white w-full">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:w-[900px] xl:w-[1000px] 2xl:w-[1200px] 3xl:w-[1596px]">
          <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-mont font-bold text-gray-900 text-left mb-2 sm:mb-3 md:mb-4 xl:text-[30px] 2xl:text-[30px] 3xl:text-[40px]"
              style={{
                fontFamily: "mont-regular",
              }}
            >
              Our Goals
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 pr-0 sm:pr-10 md:pr-20 lg:pr-40 text-left 3xl:text-xl 2xl:text-sm xl:text-[10px] lg:text-[10px]">
              At Skillbridge, our goal is to empower individuals from all
              backgrounds to thrive in the world of design and development. We
              believe that education should be accessible and transformative,
              enabling learners to pursue their passions and make a meaningful
              impact. Through our carefully crafted courses, we aim to:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-[3rem] gap-x-4 sm:gap-x-[3rem] 3xl:p-10 2xl:p-10">
            <div className="flex flex-col space-y-3 sm:space-y-4 items-start 3xl:w-[683px] 2xl:w-[400px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl 3xl:mb-5 flex items-center justify-center flex-shrink-0">
                <img src={provide} alt="Provide icon" />
              </div>
              <div>
                <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                  Provide Practical Skills:
                </h3>
                <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                  Equip learners with real-world, hands-on abilities directly
                  applicable to industry demands.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-3 sm:space-y-4 3xl:w-[683px] 2xl:w-[400px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl 3xl:mb-5 flex items-center justify-center flex-shrink-0">
                <img src={foster} alt="Foster icon" />
              </div>
              <div>
                <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                  Foster Creative Problem-Solving:
                </h3>
                <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                  Cultivate innovative thinking and the capacity to tackle
                  complex challenges with unique.
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-3 sm:space-y-4 items-start">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <img src={promote} alt="Promote icon" />
              </div>
              <div>
                <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                  Promote Collaboration and Community:
                </h3>
                <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                  Build a supportive network where learners can connect, share
                  knowledge.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <img src={stay} alt="Stay icon" />
              </div>
              <div>
                <h3 className="font-mont font-medium text-gray-900 text-lg sm:text-xl md:text-2xl 3xl:mb-5 3xl:text-[36px] 2xl:text-[26px] lg:text-[15px]">
                  Stay Ahead of the Curve:
                </h3>
                <p className="text-gray-600 text-sm sm:text-base 3xl:text-[20px] 2xl:text-[16px] 3xl:w-[100%] lg:text-[15px]">
                  Ensure our curriculum remains cutting-edge, incorporating
                  the latest trends to keep learners competitive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StarcTeam />
      <WallOfLove />
      <div className="flex justify-center px-4">
        <PurpleBox />
      </div>
      <Footer />
    </div>
  );
};

export default About;
