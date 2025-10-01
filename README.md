# Next.js + Go Full-Stack Project

A minimal full-stack application with a Next.js frontend and Go backend.

## Project Structure

\`\`\`
/
├── app/
│   └── page.tsx          # Frontend form page
├── backend/
│   ├── main.go           # Go backend server
│   └── go.mod            # Go module file
└── README.md
\`\`\`

## Requirements

- **Frontend**: Node.js 18+ and npm/pnpm/yarn
- **Backend**: Go 1.21+

## Running the Backend (Go)

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Run the Go server:
   \`\`\`bash
   go run main.go
   \`\`\`

   The server will start on `http://localhost:8080`

## Running the Frontend (Next.js)

1. From the root directory, install dependencies:
   \`\`\`bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Start the Go backend first** (port 8080)
2. **Then start the Next.js frontend** (port 3000)
3. Enter a username in the form and click Submit
4. The backend will respond with a success message

## CAPTCHA Integration

The `<div id="captcha-container">` is currently a placeholder in the form. You can integrate your preferred CAPTCHA solution (like Google reCAPTCHA, hCaptcha, etc.) by:

1. Adding the CAPTCHA library script to your application
2. Initializing the CAPTCHA widget inside the `captcha-container` div
3. Collecting the CAPTCHA token on form submission
4. Sending it to the backend for verification

The container is left empty intentionally for you to add your chosen CAPTCHA implementation later.

## API Endpoint

### POST /api/submit

**Request:**
\`\`\`json
{
  "username": "example"
}
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "message": "Hello example, your form was submitted successfully!"
}
\`\`\`

**Error Response (400):**
\`\`\`json
{
  "error": "Invalid JSON format"
}
\`\`\`

## Notes

- The backend includes CORS headers to allow requests from the frontend
- Error handling is implemented for invalid/malformed JSON
- The form includes basic validation and loading states
