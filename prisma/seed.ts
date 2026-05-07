/**
 * EduFlow — Database Seed Script
 *
 * Creates realistic demo data for development and review:
 *   - 1 admin + 4 instructors + 5 students
 *   - 8 categories
 *   - 12 courses (10 published, 2 draft) with chapters, attachments
 *   - Enrollments, progress records, and reviews
 *
 * Idempotent: wipes existing data in dependency order before seeding.
 * Safe to re-run at any time.
 *
 * Run: npm run db:seed
 */

import { config } from "dotenv";

// Must load before any env-dependent imports
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import {
  CourseLevel,
  CourseStatus,
  PrismaClient,
  Role,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hash = (plain: string) => bcrypt.hash(plain, 10);

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    name: "Web Development",
    slug: "web-development",
    description: "HTML, CSS, JavaScript, React, Next.js and more.",
    color: "#3B82F6",
  },
  {
    name: "Data Science & AI",
    slug: "data-science-ai",
    description: "Python, Machine Learning, Deep Learning, and Data Analysis.",
    color: "#8B5CF6",
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description: "iOS, Android, Flutter, React Native.",
    color: "#10B981",
  },
  {
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    description: "AWS, GCP, Azure, Docker, Kubernetes, CI/CD.",
    color: "#F97316",
  },
  {
    name: "Design & UX",
    slug: "design-ux",
    description: "UI/UX Design, Figma, Product Design, Accessibility.",
    color: "#EC4899",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Ethical Hacking, Penetration Testing, Network Security.",
    color: "#EF4444",
  },
  {
    name: "Business & Finance",
    slug: "business-finance",
    description: "Entrepreneurship, Financial Modeling, Management.",
    color: "#EAB308",
  },
  {
    name: "Programming Languages",
    slug: "programming-languages",
    description: "TypeScript, Rust, Go, Python fundamentals and more.",
    color: "#14B8A6",
  },
];

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱  Starting seed...\n");

  // ── 1. Wipe existing data (reverse dependency order) ──────────────────────
  console.log("  → Clearing existing data...");
  await prisma.progress.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructorProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Cleared\n");

  // ── 2. Categories ──────────────────────────────────────────────────────────
  console.log("  → Seeding categories...");
  const categories = await Promise.all(
    CATEGORIES.map((c) =>
      prisma.category.create({
        data: c,
      }),
    ),
  );
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  console.log(`  ✓ ${categories.length} categories\n`);

  // ── 3. Users ───────────────────────────────────────────────────────────────
  console.log("  → Seeding users...");
  const defaultPassword = await hash("password123");

  const admin = await prisma.user.create({
    data: {
      name: "EduFlow Admin",
      email: "admin@eduflow.dev",
      hashedPassword: defaultPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const [sarah, marcus, priya, alex] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Sarah Chen",
        email: "sarah@eduflow.dev",
        hashedPassword: defaultPassword,
        role: Role.INSTRUCTOR,
        emailVerified: new Date(),
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Johnson",
        email: "marcus@eduflow.dev",
        hashedPassword: defaultPassword,
        role: Role.INSTRUCTOR,
        emailVerified: new Date(),
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Patel",
        email: "priya@eduflow.dev",
        hashedPassword: defaultPassword,
        role: Role.INSTRUCTOR,
        emailVerified: new Date(),
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
      },
    }),
    prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: "alex@eduflow.dev",
        hashedPassword: defaultPassword,
        role: Role.INSTRUCTOR,
        emailVerified: new Date(),
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      },
    }),
  ]);

  const [alice, bob, carol, david, emma] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Thompson",
        email: "alice@student.dev",
        hashedPassword: defaultPassword,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Martinez",
        email: "bob@student.dev",
        hashedPassword: defaultPassword,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: "Carol Williams",
        email: "carol@student.dev",
        hashedPassword: defaultPassword,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: "David Kim",
        email: "david@student.dev",
        hashedPassword: defaultPassword,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: "Emma Davis",
        email: "emma@student.dev",
        hashedPassword: defaultPassword,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log("  ✓ 10 users (1 admin, 4 instructors, 5 students)\n");

  // ── 4. Instructor profiles ─────────────────────────────────────────────────
  console.log("  → Seeding instructor profiles...");
  const [sarahProfile, marcusProfile, priyaProfile, alexProfile] =
    await Promise.all([
      prisma.instructorProfile.create({
        data: {
          userId: sarah.id,
          headline: "Senior Full-Stack Developer & Educator",
          bio: "Sarah has 8+ years of experience building production web applications with React, Next.js, and Node.js. She has taught over 120,000 students and is passionate about making modern web development accessible to everyone. Previously a Senior Engineer at Stripe and Vercel.",
          website: "https://sarahchen.dev",
          twitter: "sarahchendev",
          linkedin: "sarah-chen-dev",
          avatarUrl: sarah.image,
          totalStudents: 127483,
        },
      }),
      prisma.instructorProfile.create({
        data: {
          userId: marcus.id,
          headline: "Senior Data Scientist & ML Engineer",
          bio: "Marcus holds a PhD in Computer Science from MIT with a focus on deep learning. He spent 4 years at Google Brain and has published 12 peer-reviewed papers. His mission is to demystify AI for working engineers and make cutting-edge ML techniques practical.",
          website: "https://marcusjohnson.ai",
          twitter: "marcusjohnsonml",
          linkedin: "marcus-johnson-ml",
          avatarUrl: marcus.image,
          totalStudents: 94210,
        },
      }),
      prisma.instructorProfile.create({
        data: {
          userId: priya.id,
          headline: "Cloud Architect & DevOps Expert",
          bio: "Priya is an AWS Certified Solutions Architect (Professional) and Certified Kubernetes Administrator with 10+ years in cloud infrastructure. Ex-Amazon Web Services Principal Engineer. She consults for Fortune 500 companies and has helped 80,000+ engineers pass their cloud certifications.",
          website: "https://priyapatel.cloud",
          twitter: "priyacloudarch",
          linkedin: "priya-patel-aws",
          avatarUrl: priya.image,
          totalStudents: 83742,
        },
      }),
      prisma.instructorProfile.create({
        data: {
          userId: alex.id,
          headline: "Product Designer & iOS Developer",
          bio: "Alex is a former lead designer at Airbnb and Apple with over 15 years of experience in product design and mobile development. He is the creator of several top-rated iOS apps and speaks at design conferences worldwide. Specializes in design systems, accessibility, and human-centered design.",
          website: "https://alexrivera.design",
          twitter: "alexrivdesign",
          linkedin: "alex-rivera-design",
          avatarUrl: alex.image,
          totalStudents: 61894,
        },
      }),
    ]);
  console.log("  ✓ 4 instructor profiles\n");

  // ── 5. Courses ─────────────────────────────────────────────────────────────
  console.log("  → Seeding courses...");

  // Helper to build chapter arrays for createMany
  type ChapterInput = {
    title: string;
    description: string;
    position: number;
    isPublished: boolean;
    isFree: boolean;
    videoDuration: number;
  };

  function ch(
    position: number,
    title: string,
    description: string,
    opts: { isFree?: boolean; duration?: number } = {},
  ): ChapterInput {
    return {
      title,
      description,
      position,
      isPublished: true,
      isFree: opts.isFree ?? position === 1, // first chapter always free
      videoDuration: opts.duration ?? Math.floor(Math.random() * 1800 + 600), // 10–40 min
    };
  }

  // ── COURSE 1: React ─────────────────────────────────────────────────────
  const reactCourse = await prisma.course.create({
    data: {
      title: "The Complete React Developer Course 2025",
      slug: slug("The Complete React Developer Course 2025"),
      shortDescription:
        "Master React 19, Hooks, Context, Redux Toolkit, React Query, and build 5 production-grade projects.",
      description: `Become a confident, job-ready React developer from scratch. This course takes you from zero to building real-world applications using the latest React 19 features including the new compiler, use() hook, Server Components, and more.\n\nYou'll build 5 real projects: a task manager, a movie discovery app, a real-time chat, an e-commerce storefront, and a full-stack social platform.\n\nCovers: JSX, component architecture, custom hooks, context API, React Query v5, Zustand, React Router v7, testing with Vitest + Testing Library, and deployment to Vercel.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      price: 89.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      requirements: [
        "Basic HTML and CSS knowledge",
        "Fundamental JavaScript (variables, functions, arrays)",
        "No prior React experience needed",
      ],
      objectives: [
        "Build production-ready React 19 applications",
        "Master hooks, context, and component patterns",
        "Implement state management with Zustand and React Query",
        "Write tests with Vitest and Testing Library",
        "Deploy full-stack apps to Vercel",
      ],
      avgRating: 4.8,
      totalStudents: 48291,
      publishedAt: new Date("2024-03-15"),
      instructorId: sarahProfile.id,
      categoryId: catMap["web-development"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Welcome & Course Overview",
              "Introduction to the course, what we will build, and how to get the most out of your learning journey.",
              { isFree: true, duration: 420 },
            ),
            ch(
              2,
              "React Fundamentals: JSX and Components",
              "Deep dive into JSX syntax, component composition, props, and the React component lifecycle in 2025.",
              { duration: 2340 },
            ),
            ch(
              3,
              "Hooks: useState, useEffect, and Custom Hooks",
              "Master React's hook system. Build your own custom hooks to share logic across components.",
              { duration: 3120 },
            ),
            ch(
              4,
              "State Management with Zustand & React Query",
              "Replace complex Redux boilerplate with Zustand for client state and React Query v5 for server state.",
              { duration: 2880 },
            ),
            ch(
              5,
              "Building the Full-Stack Social Platform",
              "Capstone project: build a Twitter-like social platform with Next.js App Router, Prisma, and Cloudinary.",
              { duration: 5400 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 2: Next.js ───────────────────────────────────────────────────
  const nextjsCourse = await prisma.course.create({
    data: {
      title: "Next.js 15 & React — The Complete Developer Guide",
      slug: slug("Next.js 15 React The Complete Developer Guide"),
      shortDescription:
        "Master Next.js 15 App Router, Server Components, Server Actions, and build a production SaaS application.",
      description: `The most comprehensive Next.js 15 course available. Learn everything about the App Router, React Server Components, Server Actions, streaming, Suspense, advanced caching strategies, and deploying to Vercel at scale.\n\nYou'll build a complete project management SaaS with authentication, team collaboration, file uploads, real-time updates, and Stripe billing — all deployed and production-ready.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&q=80",
      price: 79.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      requirements: [
        "Solid JavaScript and React fundamentals",
        "Basic TypeScript knowledge helpful but not required",
        "Familiarity with HTML/CSS",
      ],
      objectives: [
        "Build full-stack applications with Next.js 15 App Router",
        "Use React Server Components effectively",
        "Implement Server Actions for secure mutations",
        "Master advanced caching and revalidation patterns",
        "Deploy production apps to Vercel with CI/CD",
      ],
      avgRating: 4.9,
      totalStudents: 31742,
      publishedAt: new Date("2024-08-01"),
      instructorId: sarahProfile.id,
      categoryId: catMap["web-development"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Next.js 15 Architecture Deep Dive",
              "Understanding the App Router, Server vs Client Components, and how the new compiler works under the hood.",
              { isFree: true, duration: 1800 },
            ),
            ch(
              2,
              "Server Components & Data Fetching",
              "Fetch data directly in Server Components, understand streaming with Suspense, and implement optimistic updates.",
              { duration: 3600 },
            ),
            ch(
              3,
              "Server Actions & Mutations",
              "Replace REST endpoints with Server Actions. Handle forms, validation with Zod, and optimistic UI updates.",
              { duration: 2700 },
            ),
            ch(
              4,
              "Authentication with Auth.js v5",
              "Implement database-session auth with Google OAuth and credentials provider. Role-based route protection.",
              { duration: 3000 },
            ),
            ch(
              5,
              "Production Deployment & Performance",
              "Deploy to Vercel, configure Edge Middleware, optimize images, implement ISR and on-demand revalidation.",
              { duration: 2400 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 3: JavaScript Advanced ──────────────────────────────────────
  const jsCourse = await prisma.course.create({
    data: {
      title: "JavaScript: The Advanced Concepts",
      slug: slug("JavaScript The Advanced Concepts"),
      shortDescription:
        "Deep dive into closures, prototypes, async patterns, the event loop, and modern ES2025 features.",
      description: `Go beyond the basics and truly understand how JavaScript works. This course covers the JavaScript engine, execution context, closures, prototypal inheritance, functional programming, async/await internals, the event loop, memory management, and the latest ES2025 features.\n\nPerfect for developers who know JS basics but want to master the language at a professional level.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80",
      price: 84.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.ADVANCED,
      language: "English",
      requirements: [
        "1+ year working with JavaScript",
        "Comfortable with ES6+ syntax",
        "Basic understanding of asynchronous programming",
      ],
      objectives: [
        "Understand the JavaScript engine and call stack",
        "Master closures, scope chains, and execution contexts",
        "Implement functional programming patterns",
        "Write truly asynchronous code with confidence",
        "Use advanced TypeScript generics and type utilities",
      ],
      avgRating: 4.7,
      totalStudents: 22104,
      publishedAt: new Date("2024-01-20"),
      instructorId: sarahProfile.id,
      categoryId: catMap["web-development"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "JavaScript Under the Hood",
              "V8 engine internals, JIT compilation, hidden classes, and why understanding the engine makes you a better developer.",
              { isFree: true, duration: 2100 },
            ),
            ch(
              2,
              "Closures, Scope & the Prototype Chain",
              "The most misunderstood concepts in JavaScript explained clearly with real-world examples and exercises.",
              { duration: 3300 },
            ),
            ch(
              3,
              "Async JavaScript: Promises, Generators & Async Iterators",
              "From callbacks to async/await. Understand microtasks vs macrotasks and build resilient async pipelines.",
              { duration: 3600 },
            ),
            ch(
              4,
              "Functional Programming & Modern Patterns",
              "Currying, composition, immutability, monads, and how to write maintainable, testable JavaScript at scale.",
              { duration: 2700 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 4: Python ML ─────────────────────────────────────────────────
  const pythonCourse = await prisma.course.create({
    data: {
      title: "Python for Machine Learning & Data Science 2025",
      slug: slug("Python for Machine Learning Data Science 2025"),
      shortDescription:
        "Complete ML bootcamp: NumPy, Pandas, Matplotlib, Scikit-Learn, TensorFlow, and real-world projects.",
      description: `The most complete Data Science and Machine Learning course. Start with Python fundamentals, work through NumPy and Pandas for data manipulation, Matplotlib and Seaborn for visualization, then master Scikit-Learn for classical ML and TensorFlow 3 for deep learning.\n\nIncludes 6 capstone projects: house price prediction, customer churn model, image classifier, NLP sentiment analysis, recommendation engine, and a live ML API deployed to GCP.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      price: 94.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.BEGINNER,
      language: "English",
      requirements: [
        "No prior Python or ML experience needed",
        "Basic high-school algebra helpful",
        "A computer with internet access",
      ],
      objectives: [
        "Write Python confidently for data analysis",
        "Clean, transform, and visualize real datasets",
        "Train, evaluate, and tune ML models with Scikit-Learn",
        "Build neural networks with TensorFlow and Keras",
        "Deploy ML models as REST APIs",
      ],
      avgRating: 4.8,
      totalStudents: 61943,
      publishedAt: new Date("2024-02-10"),
      instructorId: marcusProfile.id,
      categoryId: catMap["data-science-ai"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Python & Data Science Environment Setup",
              "Install Python 3.12, Jupyter, and set up a reproducible environment with conda. Tour the data science ecosystem.",
              { isFree: true, duration: 1200 },
            ),
            ch(
              2,
              "NumPy & Pandas: Data Wrangling at Scale",
              "Vectorized operations, broadcasting, DataFrame manipulation, merging datasets, and handling missing data.",
              { duration: 4200 },
            ),
            ch(
              3,
              "Exploratory Data Analysis & Visualization",
              "Statistical summaries, correlation analysis, Matplotlib/Seaborn charts, and storytelling with data.",
              { duration: 3000 },
            ),
            ch(
              4,
              "Classical ML with Scikit-Learn",
              "Regression, classification, clustering, feature engineering, cross-validation, and hyperparameter tuning.",
              { duration: 4800 },
            ),
            ch(
              5,
              "Deep Learning Foundations with TensorFlow",
              "Neural network architecture, backpropagation, CNNs for images, and RNNs for sequences.",
              { duration: 5400 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 5: Deep Learning ─────────────────────────────────────────────
  const dlCourse = await prisma.course.create({
    data: {
      title: "Deep Learning with PyTorch: Zero to Research",
      slug: slug("Deep Learning with PyTorch Zero to Research"),
      shortDescription:
        "Build and train neural networks from scratch: CNNs, Transformers, Diffusion Models, and RL agents.",
      description: `From first principles to cutting-edge research. This course goes beyond tutorials to build real understanding of how deep learning works. You'll implement neural networks from scratch in NumPy, then leverage PyTorch 2.4 for modern architectures.\n\nTopics: automatic differentiation, CNNs, ResNets, Transformers (from scratch), ViTs, diffusion models, reinforcement learning basics, and how to read ML papers.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
      price: 99.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.ADVANCED,
      language: "English",
      requirements: [
        "Solid Python and NumPy skills",
        "Linear algebra and calculus fundamentals",
        "Basic ML knowledge (regression, classification)",
      ],
      objectives: [
        "Implement neural networks from scratch in NumPy",
        "Master PyTorch 2.4 for production-grade DL",
        "Build and train Transformers and ViTs",
        "Understand and implement diffusion models",
        "Read and reproduce ML research papers",
      ],
      avgRating: 4.9,
      totalStudents: 18432,
      publishedAt: new Date("2024-06-15"),
      instructorId: marcusProfile.id,
      categoryId: catMap["data-science-ai"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Neural Networks from Scratch",
              "Build a multi-layer perceptron in pure NumPy. Forward pass, backpropagation, gradient descent — understood deeply.",
              { isFree: true, duration: 3600 },
            ),
            ch(
              2,
              "PyTorch Deep Dive",
              "Tensors, autograd, custom datasets, DataLoaders, training loops, and GPU acceleration with CUDA.",
              { duration: 4200 },
            ),
            ch(
              3,
              "Convolutional Networks & Computer Vision",
              "CNN architectures from LeNet to ResNet-50. Transfer learning, data augmentation, and object detection.",
              { duration: 5400 },
            ),
            ch(
              4,
              "Transformers & Large Language Models",
              "Attention mechanism, multi-head attention, positional encoding, build GPT-2 from scratch, and fine-tune LLMs.",
              { duration: 6000 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 6: AWS ───────────────────────────────────────────────────────
  const awsCourse = await prisma.course.create({
    data: {
      title: "AWS Solutions Architect — Complete Certification Guide 2025",
      slug: slug("AWS Solutions Architect Complete Certification Guide 2025"),
      shortDescription:
        "Pass the AWS SAA-C03 exam and architect real-world cloud solutions. Hands-on labs included.",
      description: `The most complete AWS Solutions Architect course for the SAA-C03 exam. Covers every exam topic: EC2, S3, RDS, DynamoDB, VPC networking, IAM, Lambda, ECS/EKS, CloudFront, Route 53, API Gateway, and architectural best practices.\n\nIncludes 40+ hands-on lab exercises, 3 practice exams (each 65 questions), and real-world architecture walkthroughs of systems used at Amazon, Netflix, and Airbnb.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
      price: 99.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      requirements: [
        "Basic understanding of computing concepts (servers, databases)",
        "Some cloud familiarity helpful but not required",
        "A free-tier AWS account",
      ],
      objectives: [
        "Pass the AWS Solutions Architect Associate exam (SAA-C03)",
        "Design scalable, fault-tolerant AWS architectures",
        "Configure VPC networking, security groups, and IAM policies",
        "Implement serverless architectures with Lambda and API Gateway",
        "Optimize costs using AWS pricing models",
      ],
      avgRating: 4.7,
      totalStudents: 43821,
      publishedAt: new Date("2024-04-01"),
      instructorId: priyaProfile.id,
      categoryId: catMap["cloud-devops"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "AWS Global Infrastructure & IAM",
              "Regions, Availability Zones, edge locations, and IAM — the security foundation of every AWS account.",
              { isFree: true, duration: 2400 },
            ),
            ch(
              2,
              "Compute: EC2, Auto Scaling & Load Balancing",
              "Instance types, AMIs, user data scripts, ALB vs NLB, Auto Scaling Groups, and spot instance strategies.",
              { duration: 5400 },
            ),
            ch(
              3,
              "Storage: S3, EBS, EFS & Glacier",
              "S3 storage classes, versioning, lifecycle policies, replication, presigned URLs, and encryption at rest.",
              { duration: 4200 },
            ),
            ch(
              4,
              "Databases: RDS, Aurora, DynamoDB & ElastiCache",
              "Multi-AZ RDS, Aurora global clusters, DynamoDB single-table design, read replicas, and caching strategies.",
              { duration: 4800 },
            ),
            ch(
              5,
              "Serverless & Microservices: Lambda, ECS, EKS",
              "Lambda execution model, cold starts, container deployments on Fargate, Kubernetes on EKS, and service meshes.",
              { duration: 4200 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 7: Docker & Kubernetes ───────────────────────────────────────
  const dockerCourse = await prisma.course.create({
    data: {
      title: "Docker & Kubernetes: The Practical Production Guide",
      slug: slug("Docker Kubernetes The Practical Production Guide"),
      shortDescription:
        "Containerize any application, orchestrate with Kubernetes, and build enterprise-grade CI/CD pipelines.",
      description: `From Docker basics to Kubernetes in production. Learn how to containerize applications, define multi-service architectures with Docker Compose, and orchestrate at scale with Kubernetes.\n\nCovers: Dockerfiles, multi-stage builds, container networking, Kubernetes pods/deployments/services, Helm charts, horizontal pod autoscaling, GitOps with ArgoCD, and building a production CI/CD pipeline with GitHub Actions.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
      price: 89.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      requirements: [
        "Linux command line basics",
        "Some experience with web applications",
        "Basic networking knowledge (ports, HTTP)",
      ],
      objectives: [
        "Containerize any application with Docker",
        "Orchestrate microservices with Kubernetes",
        "Build production-grade CI/CD pipelines",
        "Deploy GitOps workflows with ArgoCD",
        "Monitor containerized apps with Prometheus & Grafana",
      ],
      avgRating: 4.8,
      totalStudents: 29104,
      publishedAt: new Date("2024-05-20"),
      instructorId: priyaProfile.id,
      categoryId: catMap["cloud-devops"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Docker Fundamentals",
              "Images vs containers, the Docker daemon, Dockerfiles, layers, and building your first containerized app.",
              { isFree: true, duration: 2700 },
            ),
            ch(
              2,
              "Docker Compose & Multi-Service Apps",
              "Define, build, and run multi-container applications with Docker Compose. Networking, volumes, and secrets.",
              { duration: 3000 },
            ),
            ch(
              3,
              "Kubernetes Core Concepts",
              "Pods, Deployments, Services, ConfigMaps, Secrets, persistent volumes, and the Kubernetes control plane.",
              { duration: 4800 },
            ),
            ch(
              4,
              "Production Kubernetes & GitOps",
              "Helm charts, horizontal pod autoscaling, rolling updates, ArgoCD for GitOps, and cluster monitoring.",
              { duration: 4200 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 8: iOS / SwiftUI ─────────────────────────────────────────────
  const iosCourse = await prisma.course.create({
    data: {
      title: "iOS App Development with SwiftUI — From Zero to App Store",
      slug: slug("iOS App Development SwiftUI Zero to App Store"),
      shortDescription:
        "Build beautiful iOS apps with SwiftUI 6 and Swift 6. Publish your first app to the App Store.",
      description: `Learn iOS development from an Apple veteran. This course takes you from absolute beginner to publishing your first iOS app on the App Store. We use the latest SwiftUI 6 and Swift 6 concurrency model throughout.\n\nYou'll build 4 complete apps: a weather app, a habit tracker, a photo journal with CloudKit sync, and a social feed app with real-time updates. All apps are App Store ready.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      price: 79.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.BEGINNER,
      language: "English",
      requirements: [
        "A Mac running macOS 14 (Sonoma) or later",
        "Xcode 16 (free from the Mac App Store)",
        "No prior Swift or iOS experience needed",
      ],
      objectives: [
        "Build iOS apps with SwiftUI 6 and Swift 6",
        "Understand Swift's concurrency model (async/await, actors)",
        "Persist data with SwiftData and CloudKit",
        "Publish apps to the App Store",
        "Implement push notifications and background tasks",
      ],
      avgRating: 4.8,
      totalStudents: 24731,
      publishedAt: new Date("2024-09-10"),
      instructorId: alexProfile.id,
      categoryId: catMap["mobile-development"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Swift Fundamentals & Xcode Mastery",
              "Swift 6 syntax, types, control flow, optionals, and the Xcode 16 workflow — building productive habits from day one.",
              { isFree: true, duration: 2400 },
            ),
            ch(
              2,
              "SwiftUI Views, Layout & Animation",
              "Stacks, grids, lists, NavigationStack, sheets, custom animations, and building adaptive layouts for iPhone and iPad.",
              { duration: 4800 },
            ),
            ch(
              3,
              "Data, Networking & SwiftData",
              "Async/await for network calls, Codable JSON parsing, SwiftData for local persistence, and CloudKit sync.",
              { duration: 4200 },
            ),
            ch(
              4,
              "App Store Submission & Post-Launch",
              "Code signing, TestFlight, App Store Connect, screenshots, app review guidelines, and responding to reviews.",
              { duration: 2400 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 9: UI/UX Design ──────────────────────────────────────────────
  const designCourse = await prisma.course.create({
    data: {
      title: "UI/UX Design Bootcamp: Zero to Job Ready",
      slug: slug("UI UX Design Bootcamp Zero to Job Ready"),
      shortDescription:
        "Master Figma, design systems, user research, and build a professional portfolio that gets you hired.",
      description: `Land your first UX design job with a portfolio that stands out. This bootcamp covers the complete design process: user research, wireframing, prototyping, visual design, usability testing, and handoff to engineering.\n\nIncludes 5 real-world design challenges judged by industry professionals, a complete design system project, and a portfolio review session. Taught by an ex-Airbnb and Apple designer.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      price: 69.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.BEGINNER,
      language: "English",
      requirements: [
        "No design experience needed",
        "A computer (Mac or PC)",
        "Figma account (free tier is fine)",
      ],
      objectives: [
        "Master Figma for professional UI design",
        "Conduct user interviews and usability tests",
        "Build and document a complete design system",
        "Create portfolio-worthy case studies",
        "Prepare for UX design job interviews",
      ],
      avgRating: 4.6,
      totalStudents: 19842,
      publishedAt: new Date("2024-07-05"),
      instructorId: alexProfile.id,
      categoryId: catMap["design-ux"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Design Thinking & the UX Process",
              "Empathize, define, ideate, prototype, test. The double diamond framework and when to use which method.",
              { isFree: true, duration: 1800 },
            ),
            ch(
              2,
              "Figma Mastery: From Wireframes to High-Fidelity",
              "Auto-layout, components, variants, design tokens, interactive prototypes, and collaborative workflows.",
              { duration: 5400 },
            ),
            ch(
              3,
              "Visual Design Principles & Typography",
              "Grid systems, typographic hierarchy, color theory, spacing, contrast, and accessibility (WCAG 2.2 compliance).",
              { duration: 3600 },
            ),
            ch(
              4,
              "Building Your Portfolio & Landing Interviews",
              "Crafting compelling case studies, structuring your portfolio site, LinkedIn optimization, and interview preparation.",
              { duration: 2700 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 10: Ethical Hacking ──────────────────────────────────────────
  const secCourse = await prisma.course.create({
    data: {
      title: "Ethical Hacking & Penetration Testing A to Z",
      slug: slug("Ethical Hacking Penetration Testing A to Z"),
      shortDescription:
        "Learn offensive security from a CEH. Recon, exploitation, post-exploitation, and reporting.",
      description: `A practical, hands-on penetration testing course taught by a Certified Ethical Hacker (CEH) and OSCP holder. Use Kali Linux, Metasploit, Burp Suite, and custom Python scripts to identify and exploit real vulnerabilities.\n\nAll labs use intentionally vulnerable VMs. Covers the full pentest lifecycle: OSINT, network scanning, web app hacking, privilege escalation, lateral movement, and writing professional security reports.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
      price: 94.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      requirements: [
        "Basic Linux command line skills",
        "Networking fundamentals (TCP/IP, DNS, HTTP)",
        "Some Python scripting experience",
      ],
      objectives: [
        "Perform full penetration tests against web apps and networks",
        "Use professional tools: Burp Suite, Nmap, Metasploit",
        "Exploit OWASP Top 10 web vulnerabilities",
        "Write professional security assessment reports",
        "Prepare for CEH and OSCP certifications",
      ],
      avgRating: 4.7,
      totalStudents: 15293,
      publishedAt: new Date("2024-10-15"),
      instructorId: priyaProfile.id,
      categoryId: catMap["cybersecurity"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Ethical Hacking Fundamentals & Lab Setup",
              "Legal frameworks, responsible disclosure, setting up Kali Linux and VirtualBox, and your first vulnerability scan.",
              { isFree: true, duration: 1800 },
            ),
            ch(
              2,
              "Network Reconnaissance & Scanning",
              "OSINT techniques, Nmap scanning, Shodan, service enumeration, and building a target profile.",
              { duration: 3600 },
            ),
            ch(
              3,
              "Web Application Hacking",
              "SQL injection, XSS, CSRF, IDOR, SSRF, XXE, insecure deserialization, and Burp Suite workflows.",
              { duration: 5400 },
            ),
            ch(
              4,
              "Exploitation & Post-Exploitation",
              "Metasploit framework, custom exploits, privilege escalation on Linux/Windows, persistence, and lateral movement.",
              { duration: 4800 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 11: Flutter ──────────────────────────────────────────────────
  const flutterCourse = await prisma.course.create({
    data: {
      title: "Flutter & Dart — The Complete Cross-Platform Dev Course",
      slug: slug("Flutter Dart Complete Cross Platform Dev Course"),
      shortDescription:
        "Build native iOS and Android apps from a single Dart codebase with Flutter 3.27.",
      description: `Build real, production-ready mobile apps that run on iOS and Android (plus web and desktop) from a single codebase. Learn Flutter 3.27 and Dart 3 from scratch — no mobile experience required.\n\nBuild 4 real apps: a fitness tracker, a recipe app with Firebase, a real-time chat application, and a full e-commerce app with payment integration.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      price: 74.99,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.BEGINNER,
      language: "English",
      requirements: [
        "No mobile or Flutter experience required",
        "Basic programming concepts (variables, functions)",
        "A computer (Mac, Windows, or Linux)",
      ],
      objectives: [
        "Build cross-platform apps with Flutter 3.27",
        "Master Dart 3's null safety and type system",
        "Manage state with Riverpod and Bloc",
        "Integrate Firebase for auth, database, and storage",
        "Publish apps to both App Store and Google Play",
      ],
      avgRating: 4.7,
      totalStudents: 22841,
      publishedAt: new Date("2024-11-01"),
      instructorId: marcusProfile.id,
      categoryId: catMap["mobile-development"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "Dart 3 Language Fundamentals",
              "Types, null safety, classes, mixins, extension methods, and records — the Dart features you'll use every day.",
              { isFree: true, duration: 2400 },
            ),
            ch(
              2,
              "Flutter Widgets & Layout System",
              "Widget tree, StatelessWidget vs StatefulWidget, Flex layouts, custom painters, and adaptive UI.",
              { duration: 4200 },
            ),
            ch(
              3,
              "State Management with Riverpod",
              "Providers, AsyncNotifier, family, autoDispose, and testing Riverpod-based applications.",
              { duration: 3600 },
            ),
            ch(
              4,
              "Firebase Integration & Deployment",
              "Authentication, Firestore real-time database, Cloud Storage, FCM push notifications, and publishing to both stores.",
              { duration: 4800 },
            ),
          ],
        },
      },
    },
  });

  // ── COURSE 12: TypeScript (DRAFT) ───────────────────────────────────────
  const tsCourse = await prisma.course.create({
    data: {
      title: "TypeScript Deep Dive: Build Enterprise-Grade Applications",
      slug: slug("TypeScript Deep Dive Build Enterprise Grade Applications"),
      shortDescription:
        "Advanced TypeScript: generics, conditional types, template literals, and type-safe design patterns.",
      description: `Go beyond basic TypeScript and master the advanced type system features that make enterprise codebases maintainable and refactor-safe. This course covers generics, mapped types, conditional types, template literal types, infer, and building type-safe APIs.\n\nIncludes building a type-safe ORM from scratch, a React component library with full type inference, and a backend API with Zod schema-first development.`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
      price: 64.99,
      status: CourseStatus.DRAFT,
      level: CourseLevel.ADVANCED,
      language: "English",
      requirements: [
        "1+ year with TypeScript basics",
        "Solid JavaScript fundamentals",
        "Experience with React or Node.js",
      ],
      objectives: [
        "Master TypeScript's advanced type system",
        "Build type-safe APIs with Zod and tRPC",
        "Create reusable generic libraries",
        "Write types that improve developer experience",
        "Contribute to and maintain large TypeScript codebases",
      ],
      avgRating: null,
      totalStudents: 0,
      publishedAt: null,
      instructorId: sarahProfile.id,
      categoryId: catMap["programming-languages"]!.id,
      chapters: {
        createMany: {
          data: [
            ch(
              1,
              "TypeScript's Type System Deep Dive",
              "Structural typing, type narrowing, discriminated unions, the unknown type, and why TypeScript works the way it does.",
              { isFree: true, duration: 2700 },
            ),
            ch(
              2,
              "Generics, Constraints & Inference",
              "Generic functions and classes, constraints with extends, infer keyword, conditional types, and template literal types.",
              { duration: 4200 },
            ),
            ch(
              3,
              "Type-Safe APIs with Zod and tRPC",
              "Schema-first API design with Zod, end-to-end type safety with tRPC, and integrating with Next.js App Router.",
              { duration: 3600 },
            ),
          ],
        },
      },
    },
  });

  console.log("  ✓ 12 courses (10 published, 2 draft) with chapters\n");

  // ── 6. Attachments ─────────────────────────────────────────────────────
  console.log("  → Seeding attachments...");

  const attachmentCourses = [
    { course: reactCourse, name: "React Course Source Code" },
    { course: nextjsCourse, name: "Next.js Course Source Code" },
    { course: jsCourse, name: "JavaScript Advanced Exercises" },
    { course: pythonCourse, name: "Python ML Notebooks" },
    { course: dlCourse, name: "PyTorch Deep Learning Labs" },
    { course: awsCourse, name: "AWS Architecture Diagrams" },
    { course: dockerCourse, name: "Docker & K8s Lab Files" },
    { course: iosCourse, name: "SwiftUI App Projects" },
    { course: designCourse, name: "Figma Design Files" },
    { course: secCourse, name: "Penetration Testing Scripts" },
    { course: flutterCourse, name: "Flutter App Source Code" },
  ];

  await Promise.all(
    attachmentCourses.flatMap(({ course, name }) => [
      prisma.attachment.create({
        data: {
          courseId: course.id,
          name: `${name}.zip`,
          url: `https://res.cloudinary.com/daudevlbm/raw/upload/lms/courses/${course.id}/resources/source-code.zip`,
          fileSize: Math.floor(Math.random() * 20_000_000 + 1_000_000),
          mimeType: "application/zip",
        },
      }),
      prisma.attachment.create({
        data: {
          courseId: course.id,
          name: "Course Slides.pdf",
          url: `https://res.cloudinary.com/daudevlbm/raw/upload/lms/courses/${course.id}/resources/slides.pdf`,
          fileSize: Math.floor(Math.random() * 5_000_000 + 500_000),
          mimeType: "application/pdf",
        },
      }),
      prisma.attachment.create({
        data: {
          courseId: course.id,
          name: "Quick Reference Cheatsheet.pdf",
          url: `https://res.cloudinary.com/daudevlbm/raw/upload/lms/courses/${course.id}/resources/cheatsheet.pdf`,
          fileSize: Math.floor(Math.random() * 800_000 + 100_000),
          mimeType: "application/pdf",
        },
      }),
    ]),
  );
  console.log("  ✓ 33 attachments (3 per course)\n");

  // ── 7. Enrollments ─────────────────────────────────────────────────────
  console.log("  → Seeding enrollments...");

  const enrollmentPairs = [
    // Alice → Sarah's courses
    { userId: alice.id, courseId: reactCourse.id },
    { userId: alice.id, courseId: nextjsCourse.id },
    { userId: alice.id, courseId: jsCourse.id },
    // Bob → Marcus's courses
    { userId: bob.id, courseId: pythonCourse.id },
    { userId: bob.id, courseId: dlCourse.id },
    { userId: bob.id, courseId: flutterCourse.id },
    // Carol → Priya's courses
    { userId: carol.id, courseId: awsCourse.id },
    { userId: carol.id, courseId: dockerCourse.id },
    { userId: carol.id, courseId: secCourse.id },
    // David → Alex's courses
    { userId: david.id, courseId: iosCourse.id },
    { userId: david.id, courseId: designCourse.id },
    // Emma → cross-domain
    { userId: emma.id, courseId: reactCourse.id },
    { userId: emma.id, courseId: pythonCourse.id },
    { userId: emma.id, courseId: awsCourse.id },
    { userId: emma.id, courseId: designCourse.id },
  ];

  await prisma.enrollment.createMany({ data: enrollmentPairs });
  console.log(`  ✓ ${enrollmentPairs.length} enrollments\n`);

  // ── 8. Progress ─────────────────────────────────────────────────────────
  console.log("  → Seeding progress records...");

  // Fetch chapters for courses where students have made progress
  const [reactChapters, pythonChapters, awsChapters, nextjsChapters] =
    await Promise.all([
      prisma.chapter.findMany({
        where: { courseId: reactCourse.id },
        orderBy: { position: "asc" },
      }),
      prisma.chapter.findMany({
        where: { courseId: pythonCourse.id },
        orderBy: { position: "asc" },
      }),
      prisma.chapter.findMany({
        where: { courseId: awsCourse.id },
        orderBy: { position: "asc" },
      }),
      prisma.chapter.findMany({
        where: { courseId: nextjsCourse.id },
        orderBy: { position: "asc" },
      }),
    ]);

  const progressData: Array<{
    userId: string;
    chapterId: string;
    isCompleted: boolean;
  }> = [];

  // Alice: completed chapters 1-3 of React, chapters 1-2 of Next.js
  const aliceReactProgress = reactChapters.slice(0, 3);
  const aliceNextjsProgress = nextjsChapters.slice(0, 2);
  for (const ch of aliceReactProgress) {
    progressData.push({ userId: alice.id, chapterId: ch.id, isCompleted: true });
  }
  // Chapter 4 of React is in progress (not completed)
  const reactCh4 = reactChapters[3];
  if (reactCh4) {
    progressData.push({
      userId: alice.id,
      chapterId: reactCh4.id,
      isCompleted: false,
    });
  }
  for (const ch of aliceNextjsProgress) {
    progressData.push({
      userId: alice.id,
      chapterId: ch.id,
      isCompleted: true,
    });
  }

  // Bob: completed chapters 1-2 of Python ML, chapter 1 of Deep Learning
  const bobPythonProgress = pythonChapters.slice(0, 2);
  for (const ch of bobPythonProgress) {
    progressData.push({ userId: bob.id, chapterId: ch.id, isCompleted: true });
  }
  const dlChapters = await prisma.chapter.findMany({
    where: { courseId: dlCourse.id },
    orderBy: { position: "asc" },
  });
  const dlCh1 = dlChapters[0];
  if (dlCh1) {
    progressData.push({ userId: bob.id, chapterId: dlCh1.id, isCompleted: true });
  }

  // Carol: completed chapter 1 of AWS
  const awsCh1 = awsChapters[0];
  if (awsCh1) {
    progressData.push({
      userId: carol.id,
      chapterId: awsCh1.id,
      isCompleted: true,
    });
  }

  // Emma: chapter 1 of React (free preview only)
  const reactCh1 = reactChapters[0];
  if (reactCh1) {
    progressData.push({
      userId: emma.id,
      chapterId: reactCh1.id,
      isCompleted: true,
    });
  }

  await prisma.progress.createMany({ data: progressData });
  console.log(`  ✓ ${progressData.length} progress records\n`);

  // ── 9. Reviews ──────────────────────────────────────────────────────────
  console.log("  → Seeding reviews...");

  const reviews = [
    {
      userId: alice.id,
      courseId: reactCourse.id,
      rating: 5,
      body: "Absolutely the best React course I've ever taken. Sarah explains every concept clearly and the projects are genuinely challenging. I landed a job 3 months after finishing this course. 10/10!",
    },
    {
      userId: alice.id,
      courseId: nextjsCourse.id,
      rating: 5,
      body: "The Next.js course is even better than the React one. The deep dive into Server Components and Server Actions finally made it click for me. The production deployment section alone is worth the price.",
    },
    {
      userId: emma.id,
      courseId: reactCourse.id,
      rating: 4,
      body: "Really solid content and great production quality. The only reason I'm not giving 5 stars is that the Redux section could be expanded, but overall this is top-tier material.",
    },
    {
      userId: bob.id,
      courseId: pythonCourse.id,
      rating: 5,
      body: "Marcus is a phenomenal teacher. He takes incredibly complex topics and makes them completely accessible. The ML projects are real-world relevant and the code is clean. Highly recommended!",
    },
    {
      userId: bob.id,
      courseId: dlCourse.id,
      rating: 5,
      body: "I have a CS background and this is still the most illuminating course I've taken on deep learning. Building a Transformer from scratch finally made me understand attention. A masterpiece.",
    },
    {
      userId: carol.id,
      courseId: awsCourse.id,
      rating: 4,
      body: "Comprehensive coverage of all SAA-C03 exam topics. I passed my AWS exam on the first try after taking this course. The hands-on labs are excellent. Would love more DynamoDB content.",
    },
    {
      userId: emma.id,
      courseId: awsCourse.id,
      rating: 5,
      body: "Priya clearly knows AWS inside out. The architectural walkthroughs of how Netflix and Amazon build their systems are fascinating and genuinely useful for exam prep and real projects.",
    },
    {
      userId: david.id,
      courseId: iosCourse.id,
      rating: 5,
      body: "I had zero iOS experience and now I have two apps on the App Store. Alex is an exceptional teacher who clearly loves what he does. The SwiftData section is the best explanation I've found anywhere.",
    },
  ];

  await prisma.review.createMany({ data: reviews });
  console.log(`  ✓ ${reviews.length} reviews\n`);

  // ── 10. Summary ────────────────────────────────────────────────────────
  console.log("──────────────────────────────────────────");
  console.log("✅  Seed complete!\n");
  console.log("  Demo accounts (all passwords: password123):");
  console.log("  ┌─────────────────────────────┬────────────┐");
  console.log("  │ Email                        │ Role       │");
  console.log("  ├─────────────────────────────┼────────────┤");
  console.log("  │ admin@eduflow.dev            │ ADMIN      │");
  console.log("  │ sarah@eduflow.dev            │ INSTRUCTOR │");
  console.log("  │ marcus@eduflow.dev           │ INSTRUCTOR │");
  console.log("  │ priya@eduflow.dev            │ INSTRUCTOR │");
  console.log("  │ alex@eduflow.dev             │ INSTRUCTOR │");
  console.log("  │ alice@student.dev            │ STUDENT    │");
  console.log("  │ bob@student.dev              │ STUDENT    │");
  console.log("  │ carol@student.dev            │ STUDENT    │");
  console.log("  │ david@student.dev            │ STUDENT    │");
  console.log("  │ emma@student.dev             │ STUDENT    │");
  console.log("  └─────────────────────────────┴────────────┘");
}

main()
  .catch((e) => {
    console.error("\n❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
