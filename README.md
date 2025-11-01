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

3.  **Configure Environment Variables:**
    - In your Vercel project's settings, go to "Settings" -> "Environment Variables".
    - Add your `DATABASE_URL` with the connection string from Neon.
    - Add `FRONTEND_URL` with the URL Vercel assigns to your deployment (e.g., `https://your-app-name.vercel.app`). This is crucial for CORS on the backend.

4.  **Deploy:** Click the "Deploy" button. Vercel will build the frontend, deploy the backend as a serverless function, and your site will be live.

## Default Credentials

The application comes with default credentials which should be changed immediately in the Admin Panel.

- **Login Page:**
  - **Username:** `admin`
  - **Password:** `admin`

- **Admin Panel Access:**
  - **Password:** `12`
  - Special access password for **labels only**: `names`
  - Special access password for **passwords only**: `password`
