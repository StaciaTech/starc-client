import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Mentor from '../models/Mentor.js';
import config from '../config/index.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const mentorData = [
  {
    name: 'Prem',
    email: 'prem@edifai.in',
    specialization: 'IoT',
    bio: 'Experienced IoT engineer with expertise in embedded systems and IoT architecture.',
    avatar: 'prem-profile.jpg',
    rating: 4.8
  },
  {
    name: 'Vikram',
    email: 'vikram@edifai.com',
    specialization: 'Full Stack',
    bio: 'Full stack developer with expertise in MERN stack and cloud deployment.',
    avatar: 'vikram-profile.jpg',
    rating: 4.9
  },
  {
    name: 'Ganesh Rajendran.',
    email: 'ganesh@edifai.com',
    specialization: 'Mechanical',
    bio: 'Mechanical engineer with deep knowledge of CAD design and manufacturing processes.',
    avatar: 'lakshaman-profile.jpg',
    rating: 4.6
  }
];

// Import data into DB
const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Course.deleteMany({});
    await Mentor.deleteMany({});
    
    console.log('Previous data deleted');
    
    // Insert mentors first
    const createdMentors = await Mentor.insertMany(mentorData) as any[];
    
    // Create course data with references to mentors
    const courseData = [
      {
        title: 'Internet of Things (IoT) Fundamentals',
        description: 'Learn the basics of IoT, including sensors, connectivity, and IoT architecture.',
        thumbnail: 'iot-course.jpg',
        duration: 480, // 8 hours in minutes
        instructor: createdMentors[0]._id, // Prem - IoT
        price: 250,
        discount: 10,
        level: 'intermediate',
        category: 'IoT',
        tags: ['IoT', 'Embedded Systems', 'Sensors', 'Arduino'],
        lessons: [
          {
            title: 'Introduction to IoT',
            content: 'Overview of IoT and its applications across industries.',
            duration: 60,
            order: 1,
            videoUrl: 'videos/iot-intro.mp4'
          },
          {
            title: 'IoT Architecture',
            content: 'Understanding the layered architecture of IoT systems.',
            duration: 75,
            order: 2,
            videoUrl: 'videos/iot-architecture.mp4'
          },
          {
            title: 'Sensors and Actuators',
            content: 'Deep dive into various sensors and actuators used in IoT.',
            duration: 90,
            order: 3,
            videoUrl: 'videos/iot-sensors.mp4'
          },
          {
            title: 'IoT Connectivity',
            content: 'Exploring various connectivity options for IoT devices.',
            duration: 85,
            order: 4,
            videoUrl: 'videos/iot-connectivity.mp4'
          },
          {
            title: 'Building an IoT Project',
            content: 'Hands-on project to build a simple IoT system.',
            duration: 120,
            order: 5,
            videoUrl: 'videos/iot-project.mp4'
          }
        ]
      },
      {
        title: 'Mechanical Engineering Principles',
        description: 'Comprehensive course covering core mechanical engineering concepts and applications.',
        thumbnail: 'mechanical-course.jpg',
        duration: 540, // 9 hours in minutes
        instructor: createdMentors[2]._id, // Ganesh - Mechanical
        price: 250,
        discount: 15,
        level: 'beginner',
        category: 'Mechanical',
        tags: ['Mechanical', 'CAD', 'Engineering', 'Design'],
        lessons: [
          {
            title: 'Introduction to Mechanical Engineering',
            content: 'Overview of mechanical engineering principles and applications.',
            duration: 60,
            order: 1,
            videoUrl: 'videos/mech-intro.mp4'
          },
          {
            title: 'Statics and Dynamics',
            content: 'Understanding forces and motion in mechanical systems.',
            duration: 120,
            order: 2,
            videoUrl: 'videos/mech-statics.mp4'
          },
          {
            title: 'Material Science',
            content: 'Exploring properties of materials used in mechanical design.',
            duration: 90,
            order: 3,
            videoUrl: 'videos/mech-materials.mp4'
          },
          {
            title: 'CAD Design Basics',
            content: 'Introduction to computer-aided design for mechanical systems.',
            duration: 110,
            order: 4,
            videoUrl: 'videos/mech-cad.mp4'
          },
          {
            title: 'Manufacturing Processes',
            content: 'Overview of manufacturing methods used in mechanical engineering.',
            duration: 160,
            order: 5,
            videoUrl: 'videos/mech-manufacturing.mp4'
          }
        ]
      },
      {
        title: 'Full Stack Web Development',
        description: 'Master both frontend and backend development using the MERN stack.',
        thumbnail: 'fullstack-course.jpg',
        duration: 720, // 12 hours in minutes
        instructor: createdMentors[1]._id, // Vikram - Full Stack
        price: 250,
        discount: 20,
        level: 'advanced',
        category: 'Full Stack',
        tags: ['Web Development', 'React', 'Node.js', 'MongoDB'],
        lessons: [
          {
            title: 'Introduction to Full Stack Development',
            content: 'Understanding the components of a full stack application.',
            duration: 60,
            order: 1,
            videoUrl: 'videos/fullstack-intro.mp4'
          },
          {
            title: 'Frontend Development with React',
            content: 'Building dynamic user interfaces with React.',
            duration: 180,
            order: 2,
            videoUrl: 'videos/fullstack-react.mp4'
          },
          {
            title: 'Backend Development with Node.js',
            content: 'Creating scalable server-side applications with Node.js.',
            duration: 160,
            order: 3,
            videoUrl: 'videos/fullstack-node.mp4'
          },
          {
            title: 'Database Design with MongoDB',
            content: 'Designing and implementing NoSQL databases.',
            duration: 140,
            order: 4,
            videoUrl: 'videos/fullstack-mongodb.mp4'
          },
          {
            title: 'Full Stack App Deployment',
            content: 'Deploying full stack applications to cloud platforms.',
            duration: 120,
            order: 5,
            videoUrl: 'videos/fullstack-deployment.mp4'
          },
          {
            title: 'Advanced Topics and Best Practices',
            content: 'Learning advanced techniques and industry best practices.',
            duration: 60,
            order: 6,
            videoUrl: 'videos/fullstack-advanced.mp4'
          }
        ]
      },
      {
        title: 'UI/UX Design Masterclass',
        description: 'Learn to design beautiful, user-friendly interfaces that deliver exceptional user experiences.',
        thumbnail: 'uiux-course.jpg',
        duration: 600, // 10 hours in minutes
        instructor: createdMentors[0]._id, // Prem
        price: 250,
        discount: 15,
        level: 'intermediate',
        category: 'UI/UX',
        tags: ['UI Design', 'UX Design', 'Figma', 'User Research'],
        lessons: [
          {
            title: 'Introduction to UI/UX Design',
            content: 'Understanding the principles of user interface and user experience design.',
            duration: 60,
            order: 1,
            videoUrl: 'videos/uiux-intro.mp4'
          },
          {
            title: 'User Research and Personas',
            content: 'Learning to conduct user research and create accurate user personas.',
            duration: 120,
            order: 2,
            videoUrl: 'videos/uiux-research.mp4'
          },
          {
            title: 'Wireframing and Prototyping',
            content: 'Creating wireframes and interactive prototypes for testing.',
            duration: 150,
            order: 3,
            videoUrl: 'videos/uiux-wireframing.mp4'
          },
          {
            title: 'Visual Design Principles',
            content: 'Mastering color theory, typography, and layout design.',
            duration: 130,
            order: 4,
            videoUrl: 'videos/uiux-visual.mp4'
          },
          {
            title: 'Design Systems',
            content: 'Building scalable design systems for consistent user experiences.',
            duration: 140,
            order: 5,
            videoUrl: 'videos/uiux-systems.mp4'
          }
        ]
      }
    ];
    
    // Insert courses
    const createdCourses = await Course.insertMany(courseData) as any[];
    
    // Update mentors with their courses
    const mentorUpdates = createdMentors.map(async (mentor: any) => {
      // Find the course with this mentor as instructor
      const mentorCourses = createdCourses.filter(
        (course: any) => course.instructor.toString() === mentor._id.toString()
      );
      
      // Update mentor's courses
      mentor.courses = mentorCourses.map((course: any) => course._id);
      await mentor.save();
    });
    
    await Promise.all(mentorUpdates);
    
    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await connectDB();
    await Course.deleteMany({});
    await Mentor.deleteMany({});
    
    console.log('Data deleted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Check command line argument to determine action
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify -i to import or -d to delete data');
  process.exit();
} 