# InvisiFeed - Next.js Application

InvisiFeed is a fullstack SaaS platform that enables freelancers and agencies to generate smart invoices with embedded feedback forms, collect anonymous client feedback, and analyze performance using AI — all powered by Next.js, MongoDB, and Google Generative AI.

• Code Style

- Write concise, technical JavaScript code (not TypeScript)
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Don't repeat functionality or code
- Keep code organized and consistent across the codebase
- Always return data from fetchers and actions in following format: `{ success: boolean, message: string, data?: any }`
- Always wrap fetchers and actions within try-catch block
- Use proper error handling with meaningful error messages

• App Router Structure (Next.js 15)

- Every page.jsx should be a server component by default, use client.jsx for client component within the same folder if necessary
- Use route groups (folders with parentheses) to organize routes without affecting URL structure: (auth), (owner), (customer), (marketing)
- Server components should handle data fetching directly
- Use async/await for all server components that fetch data
- Leverage Next.js 15 features: streaming, Suspense boundaries, and server components
- All middleware logic should be defined in middleware.js at root level (Next.js 15 uses middleware.js)
- Use .jsx extension for React components and .js for utility files

• Server Components & Data Fetching

- Prefer Server Components over Client Components (default to Server Components)
- Use async Server Components for data fetching: `export default async function Page() {}`
- Leverage Next.js streaming and Suspense boundaries for loading states
- Use generateStaticParams for static routes with dynamic segments
- Implement generateMetadata for SEO and dynamic metadata
- Use Suspense with LoadingScreen component for route-level loading states

• Server Actions (Next.js 15)

- Always use 'use server' directive at the top of server action files
- Use inline server actions (with 'use server') within server components when appropriate
- Use bind for form actions to pass additional parameters
- Revalidate paths and cache after mutations using revalidatePath() and revalidateTag()
- Handle form submissions with server actions instead of API routes when possible
- Use useFormStatus for form pending states in Client Components
- Always return { success: boolean, message: string, data?: any } format from server actions

• API Routes

- Use Next.js API routes (route.js) for webhooks, third-party integrations, and file uploads
- Always use NextResponse.json() for responses with proper status codes
- Return consistent format: { success: boolean, message: string, data?: any }
- Always authenticate requests using getServerSession with authOptions
- Use proper HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- Always wrap API route handlers in try-catch blocks
- Use dbConnect() at the start of every API route that needs database access

• Folder Structure

- All server actions should be defined within /actions folder
- All data fetchers should be defined within /fetchers folder
- Always use kebab-case for all folder and file names (e.g., user-profile.jsx, auth-wizard.jsx)
- All forms should be defined within /components/forms folder (if needed)
- All modals should be defined within /components/modals folder (if needed)
- All configuration files must be defined within /config folder (if needed)
- All constant data must be defined within /constants folder (if needed)
- All custom hooks must be defined within /hooks folder (if needed)
- Always add css/scss files to /styles folder (if needed)
- Always add any third-party providers to /providers folder and use it in /providers/index.jsx file (if needed)
- Use route groups for organizing pages: (auth)/sign-in/page.jsx, (owner)/user/page.jsx
- Use loading.jsx files for route-level loading states
- Use error.jsx files for route-level error boundaries
- Use not-found.jsx files for 404 handling
- Use layout.jsx files for shared layouts per route
- All models should be in /models folder with Mongoose schemas
- All schemas (Zod validation) should be in /schemas folder
- All utility functions should be in /utils folder
- All lib functions (auth, db, utils) should be in /lib folder

• Client Components

- Limit 'use client' directive to only interactive components that need browser APIs
- Keep Client Components small and colocated with data fetching logic in parent Server Components
- Use React Server Components pattern: Server Component as parent, Client Component for interactivity
- Prefer passing data as props from Server Components rather than fetching in Client Components
- Use client.jsx naming convention for client components in route folders

• Naming Conventions

- Always use kebab-case for all folder and file names (e.g., new-component.jsx, auth-wizard.jsx, user-profile/page.jsx)
- All components should go in /components and be named like new-component.jsx
- All directories must use kebab-case (e.g., components/auth-wizard, utils/format-date.js)
- Don't define custom components within /ui folder
- Favor named exports for components
- Route folders should use kebab-case: user-profile/page.jsx
- Use .jsx for React components and .js for non-React JavaScript files
- Never use camelCase, PascalCase, or snake_case for file or folder names - always use kebab-case

• JavaScript Usage

- Use JavaScript (not TypeScript) for all code
- Use proper JSDoc comments for complex functions
- Use descriptive variable and function names
- Avoid using 'any' type annotations (not applicable in JS, but avoid vague types)
- Use proper error handling with try-catch blocks
- Use async/await for asynchronous operations
- Use proper destructuring for objects and arrays

• Metadata & SEO

- Export metadata object or generateMetadata function in page.jsx and layout.jsx
- Use Next.js Metadata API for dynamic metadata generation
- Implement Open Graph and Twitter Card metadata for social sharing

• UI and Styling

- Always use colors from tailwind.config.js (or CSS variables), without opacity variants i.e. bg-background instead of bg-background/40
- Implement responsive design with Tailwind CSS
- Make sure everything you produce is mobile-friendly
- Avoid customizing base components with className unless necessary, i.e. <Card/> instead of <Card className="blah blah blah">
- Don't change element sizes on hover
- Keep UI consistent across pages
- In dialogs the cancel button should be on the right, the action button on the left, only ever have max 2 buttons in a dialog
- Use modern UI/UX design patterns
- Use dark theme as default (bg-[#0A0A0A] for main backgrounds)
- Use yellow-400/yellow-500 for primary accent colors

• Component Library (shadcn/ui)

- Never create components from scratch - always check if shadcn/ui has the component available first
- Use `npx shadcn@latest add [component-name]` to install shadcn/ui components
- Only create custom components when shadcn/ui doesn't provide the required functionality
- Extend shadcn/ui components by wrapping them rather than modifying their source code
- Keep all shadcn/ui components in the /components/ui folder as per their convention
- Use shadcn/ui's built-in variants and styling system instead of custom CSS
- Project uses "new-york" style from shadcn/ui

• Icons

- Never create SVGs from scratch - always use lucide-react icons
- Import icons from lucide-react: `import { IconName } from 'lucide-react'`
- Use lucide-react icons for all UI elements that need icons
- Only create custom SVGs when lucide-react doesn't have the specific icon needed
- Can also use react-icons if needed for specific icon sets

• Forms

- Always use shadcn/ui Form components with react-hook-form for all form inputs
- Use Form from shadcn/ui even for the smallest single input forms
- Leverage react-hook-form's validation and error handling capabilities
- Use FormField, FormItem, FormLabel, FormControl, and FormMessage components
- Never create custom form inputs when shadcn/ui Form components are available
- Use zod for form validation schemas with react-hook-form
- Use @hookform/resolvers/zod for integrating Zod with react-hook-form

• Performance Optimization

- Minimize Client Component re-renders
- Use Next.js Image component for all images with proper width/height
- Leverage automatic code splitting with App Router
- Use dynamic imports with 'use client' for heavy Client Components
- Implement Suspense boundaries for streaming and loading states
- Use loading.jsx for route-level loading states
- Leverage Next.js caching strategies: fetch cache, router cache, full route cache
- Use LoadingScreen component for loading states

• Animations

- Always use Motion for animations
- Import from 'motion/react' for React components: `import { motion } from 'motion/react'`
- Use Motion's modern API and performance optimizations
- Prefer Motion over CSS animations for complex interactions
- Use Motion's built-in variants and orchestration features

• Next.js Specific Patterns

- Always use Next.js Link component for internal navigation (same-origin links)
- Only use anchor tags (<a>) for external links, email links (mailto:), or file downloads
- Never use anchor tags for internal navigation - always use Link from 'next/link'
- Use Next.js router for programmatic navigation (useRouter from 'next/navigation')
- Implement proper error boundaries with error.jsx files
- Use not-found() function for custom 404s
- Leverage route handlers (API routes) for webhooks, file uploads, or third-party integrations
- Use cookie-based authentication with NextAuth

• Authentication

- Use NextAuth for authentication
- Authentication configuration is in /lib/auth folder
- Use getServerSession with authOptions for server-side authentication
- Use useSession from next-auth/react for client-side session access
- Session provider is wrapped in AuthProvider component
- Support both credentials and Google OAuth authentication
- Use JWT strategy for sessions

• Database

- Use MongoDB with Mongoose for database operations
- Always call dbConnect() before database operations
- All models should be in /models folder
- Use Mongoose schemas for data validation
- Use lean() queries when you don't need Mongoose document methods for better performance
- Always handle database connection errors gracefully

• Key Conventions

- Always prioritize Server Components (default)
- Use Client Components only when necessary ('use client' directive)
- Avoid using space-x and space-y, instead use flex and gap e.g. flex flex-row gap-2
- Leverage Next.js built-in patterns before introducing external solutions
- Keep Server and Client boundaries clear and well-defined
- Always check package.json before installing anything new to avoid duplicates
- Use consistent error handling patterns across the codebase

• Code Quality & ESLint

- Avoid ESLint errors and warnings - fix them immediately
- Use proper quotes: single quotes for strings, backticks for template literals
- Follow consistent formatting and indentation
- Use meaningful variable and function names
- Avoid unused imports and variables
- Use proper semicolons and trailing commas where appropriate
- Follow ESLint rules and fix all linting errors before committing

• Third-Party Services

- Cloudinary: Used for PDF and image storage, configure in API routes
- Razorpay: Used for payment processing, include checkout script in layout
- Google Generative AI: Used for AI-powered feedback analysis
- Nodemailer: Used for sending transactional emails
- ClearTax GSTIN API: Used for business validation

• File Uploads

- Use FormData for file uploads in API routes
- Convert files to buffers for PDF processing
- Upload to Cloudinary for storage
- Always validate file types and sizes
- Handle upload errors gracefully

• PDF Generation

- Use pdf-lib for PDF manipulation
- Use @react-pdf/renderer for PDF generation from React components
- Use qrcode library for QR code generation
- Merge PDFs using pdf-lib when combining invoice and QR code pages

• Charts & Analytics

- Use Recharts for all chart components
- Create reusable chart components in /components/Dashboard folder
- Ensure charts are responsive and mobile-friendly

• Toast Notifications

- Use Sonner for toast notifications
- Import toast from 'sonner'
- Use toast.success(), toast.error(), toast.info() for different notification types
- Configure Toaster component in root layout

Always write comments to explain your code.
When writing tests, never use class based selectors, only use visual selectors like text or role. If really necessary use data-testid as a last resource.

• Documentation

- Never create README, documentation, or markdown files unless explicitly requested by the user
- Do not add comments or documentation files proactively
- Focus on code implementation rather than documentation

• Agent Responses

- Never include code snippets in closing summaries; keep them concise and ensure every key point is mentioned.
