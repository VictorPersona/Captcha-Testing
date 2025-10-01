# Next.js + Go Full-Stack Project: A Minimal Guide 🚀

This document outlines the setup, execution, and structure of a minimal full-stack application featuring a **Next.js frontend** and a **Go backend**.

-----

## 📂 Project Structure

The application follows a straightforward directory structure:

```
/
├── app/
│   └── page.tsx          # Frontend form page
├── backend/
│   ├── main.go           # Go backend server logic
│   └── go.mod            # Go module file (dependencies)
└── README.md
```

-----

## 🛠️ Requirements

Ensure you have the correct environments set up for both the frontend and backend:

  * **Frontend**: **Node.js 18+** and **npm/pnpm/yarn**
  * **Backend**: **Go 1.21+**

-----

## ▶️ Running the Application

To use the application, you must start the backend server *first*, followed by the frontend development server.

### 1\. Running the Backend (Go Server)

1.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2.  Run the Go server:

    ```bash
    go run main.go
    ```

    The server will start and be accessible at **`http://localhost:8080`**.

-----

### 2\. Running the Frontend (Next.js)

1.  From the **root directory** (`/`), install the required Node.js dependencies:

    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

2.  Run the Next.js development server:

    ```bash
    npm run dev
    # or
    pnpm dev
    # or
    yarn dev
    ```

    Open **`http://localhost:3000`** in your browser.

-----

### **Usage Flow**

1.  **Start the Go backend first** (port 8080).
2.  **Then start the Next.js frontend** (port 3000).
3.  Enter a username in the frontend form and click **Submit**.
4.  The backend will process the request and respond with a success message.

-----

## 💻 API Endpoint

The frontend communicates with the backend via a single POST endpoint.

### **`POST /api/submit`**

This endpoint handles the form submission.

| Status | Body Structure | Description |
| :---: | :--- | :--- |
| **Request** | `{"username": "example"}` | Payload sent from the Next.js frontend. |
| **Success (200)** | `{"message": "Hello example, your form was submitted successfully!"}` | Returned when the submission is valid. |
| **Error (400)** | `{"error": "Invalid JSON format"}` | Returned for invalid or malformed JSON payloads. |

-----

## 🛡️ CAPTCHA Integration

The frontend includes a dedicated placeholder for integrating a security solution.

The `<div id="captcha-container">` is currently an empty placeholder in the form. To integrate a CAPTCHA solution (e.g., Google reCAPTCHA, hCaptcha):

1.  Add the **CAPTCHA library script** to your application.
2.  **Initialize the CAPTCHA widget** inside the `captcha-container` div.
3.  **Collect the CAPTCHA token** (response) on form submission.
4.  **Send the token** to the Go backend for server-side verification.

-----

## 📌 Notes

  * **CORS**: The Go backend is configured with **CORS headers** to ensure it accepts requests originating from the Next.js frontend.
  * **Error Handling**: Basic **error handling** is implemented in the backend to manage invalid or malformed JSON requests.
  * **Frontend UX**: The form includes basic client-side **validation** and handles **loading states** for a better user experience.
