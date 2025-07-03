import dragon from '../Assets/dragon.svg';

interface TeamMember {
  name: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Sarabesh Sriram",
  },
  {
    name: "Lakshman",
  },
  {
    name: "Revanth",
  },
  {
    name: "Prem",
  },
  {
    name: "Vikram",
  },
  {
    name: "Divya",
  },
  {
    name: "Abdul",
  },
  {
    name: "Rohit",
  },
];

export default function StarcTeam() {
  return (
    <section className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 flex flex-col justify-start items-center">
      <div className="w-full max-w-7xl mb-6 sm:mb-8 md:mb-12">
        <div className="flex flex-col justify-start">
          <p className="text-[#8A63FF] text-sm sm:text-base md:text-lg xl:text-[1.5rem] text-left font-mont font-semibold">
            Our Team
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-left font-mont font-medium mt-2 sm:mt-4 md:mt-8">
            Edifai, Team:
          </h2>
        </div>
      </div>

      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md p-1 relative overflow-hidden shadow-sm h-auto"
            >
              <div className="w-full h-full rounded-md bg-[#F7F8FA] p-4 sm:p-5">
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl text-gray-900 font-mont">
                    {member.name}
                  </h3>
                </div>

                <div className="absolute top-1 right-1">
                  <img src={dragon} alt="" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
