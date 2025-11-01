# Gaming Lounge System (نظام صالة الألعاب)

A comprehensive management system for a gaming lounge, featuring device tracking, session management, financial reporting, and administrative controls. Built with React and TypeScript, styled with Tailwind CSS, and connected to a Node.js/PostgreSQL backend.

## Features

- **Dashboard View**: Real-time overview of all gaming devices and their status (Available, Busy, Maintenance).
- **Session Management**:
  - Start, end, and manage gaming sessions.
  - Support for 'Open Time' or 'Timed' sessions.
  - Live timer for active sessions and cost calculation.
  - Extend timed sessions or switch to open time.
- **Reporting**:
  - View daily revenue reports and filter by date.
  - Print reports as a PDF or save as an HTML page.
- **Admin Panel** (Password Protected):
  - **Price Management**: Set hourly rates for different game types and console types.
  - **Device Management**: Add new devices, delete existing ones, or change their status.
  - **Reports Management**: Securely delete all historical report data.
  - **UI Label Customization**: Change any text label in the application's UI.
  - **Password Management**: Update login and admin passwords.
- **Persistent Data**: All data is stored in a PostgreSQL database (e.g., [Neon](https://neon.tech/)).
- **User-Friendly Interface**:
  - Multiple themes including Dark, Light, and a custom Blue/Orange theme.
  - Fully localized in Arabic.
  - Responsive design for various screen sizes.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **PDF Generation**: jsPDF, jspdf-autotable

## Getting Started

This project uses [Vite](https://vitejs.dev/) as its build tool. You will need [Node.js](https://nodejs.org/) installed on your machine.

### Prerequisites

- Node.js (version 18 or newer recommended)
- npm (usually comes with Node.js)

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

4.  **Set up environment variables:**
    - The backend requires a `DATABASE_URL` for the Neon PostgreSQL database. Create a `.env` file inside the `backend` folder.
    - Add your connection string to it:
      ```
      DATABASE_URL="postgres://user:password@endpoint.neon.tech/dbname?sslmode=require"
      ```

5.  **Run the development server:**
    - From the **root** project directory, run:
    ```bash
    npm run dev
    ```
    This command will start both the React frontend (on `http://localhost:3000`) and the Node.js backend server concurrently.

6.  **Open the application in your browser:**
    Navigate to `http://localhost:3000`.

## Deployment

This project is configured for easy deployment to platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

### Deploying to Vercel

1.  **Push your code to a GitHub repository.**

2.  **Import the project on Vercel:**
    - Sign up or log in to Vercel with your GitHub account.
    - Click "Add New... -> Project" and import your repository.
    - Vercel should automatically detect it as a Vite project. The `vercel.json` file in the root directory will configure the build and rewrites correctly to handle both the frontend and the backend API.

3.  **Configure Environment Variables (CRITICAL STEP):**
    - The local `.env` file is **not** used by Vercel. You must add the variables in the Vercel dashboard.
    - In your Vercel project's settings, go to "Settings" -> "Environment Variables".
    - Add the following two variables:
        1. **`DATABASE_URL`**:
            - **Name**: `DATABASE_URL`
            - **Value**: Your full connection string from Neon.
        2. **`FRONTEND_URL`**:
            - **Name**: `FRONTEND_URL`
            - **Value**: The production URL Vercel assigns to your deployment (e.g., `https://your-app-name.vercel.app`). This is crucial for CORS on the backend.

4.  **Deploy / Redeploy:**
    - If this is the first time, click "Deploy".
    - If you are adding the variables to an existing project, you must trigger a new deployment for the changes to take effect. Go to the "Deployments" tab and "Redeploy" the latest one.

## Debugging on Vercel

If the application is not working after deployment, the most likely cause is a problem with the backend connecting to the database. You will **not** see connection errors in the "Build Logs". You must check the **"Runtime Logs"**.

1.  Go to your project dashboard on Vercel.
2.  Click the **Logs** tab.
3.  Ensure you are viewing logs for the **Functions** and not the Build.
4.  Open your deployed application in a new browser tab. This will trigger the backend serverless function to run.
5.  Check the logs in the Vercel dashboard. You should see messages like `✅ Database connection test successful.` If there is an error, it will be printed here in red. This is the best way to diagnose post-deployment issues.

## Default Credentials

The application comes with default credentials which should be changed immediately in the Admin Panel.

- **Login Page:**
  - **Username:** `admin`
  - **Password:** `admin`

- **Admin Panel Access:**
  - **Password:** `12`
  - Special access password for **labels only**: `names`
  - Special access password for **passwords only**: `password`
