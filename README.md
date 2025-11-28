# LivePair - Real-time Collaborative Code Editor

LivePair is a web-based collaborative code editor that allows multiple users to write code together in real-time. It features a file system, syntax highlighting, IntelliSense, and code execution for Python and PHP.

## Features

-   **Real-time Collaboration**: Edit code simultaneously with others using Yjs.
-   **File System**: Create, rename, delete, and organize files.
-   **IntelliSense**: Automatic Type Acquisition (ATA) for JavaScript/TypeScript libraries.
-   **Code Execution**: Run Python (via Pyodide) and PHP (via WebAssembly) directly in the browser.
-   **Authentication**: GitHub Login support.
-   **Spectator Mode**: Read-only mode for observers.
-   **Time Travel**: Undo/Redo and Snapshot history.
-   **Themes**: Dark and Light mode support.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   [Docker](https://www.docker.com/) (Optional, for Postgres/Redis if not using SQLite)

## Installation

1.  **Fork and Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/live-pair.git
    cd live-pair
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**

    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    Edit `.env` to configure your database and (optional) GitHub credentials.
    
    *   By default, it uses SQLite (`file:./dev.db`), which requires no extra setup.
    *   To use GitHub Login, create an OAuth App on GitHub and add the Client ID and Secret.

4.  **Database Setup:**

    Run the Prisma migrations to create the database schema:

    ```bash
    npm run db:migrate
    ```

## Running the Application

You need to run both the frontend and the backend server.

1.  **Start the Backend Server:**

    ```bash
    npm run server
    ```
    The server runs on `http://localhost:1234`.

2.  **Start the Frontend Development Server:**

    Open a new terminal and run:

    ```bash
    npm run dev
    ```
    The frontend runs on `http://localhost:5173`.

3.  **Open the App:**

    Visit `http://localhost:5173` in your browser.

## Docker Support (Easy Setup)

The easiest way to run the application is using Docker Compose. This will start the database, Redis, and the application server (serving the frontend).

1.  **Start the application:**

    ```bash
    docker-compose up --build
    ```

2.  **Open the App:**

    Visit `http://localhost:1234` in your browser.

    *Note: The Docker setup uses Postgres as the database.*

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Deployment (Free & Stable)

To deploy this application for free without losing data ("crashing"), we recommend using **Render.com** for the application and **Neon.tech** for the database.

### 1. Database Setup (Neon.tech)
1.  Sign up at [Neon.tech](https://neon.tech).
2.  Create a new project.
3.  Copy the **Connection String** (Postgres URL). It looks like `postgres://user:pass@...`.

### 2. Application Deployment (Render.com)
1.  Fork this repository to your GitHub.
2.  Sign up at [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your forked repository.
5.  Select **Docker** as the Runtime.
6.  Scroll down to **Environment Variables** and add:
    *   `DATABASE_URL`: Paste your Neon connection string here.
    *   `NODE_ENV`: `production`
7.  Click **Create Web Service**.

Render will build your Docker image and deploy it. Your app will be live at a `.onrender.com` URL!

### Why this stack?
*   **Render Free Tier**: Hosts your Node.js server and WebSockets.
*   **Neon Free Tier**: Provides a robust Postgres database that doesn't expire (unlike Render's free DB).
*   **Stability**: Even if the free Render server "spins down" after inactivity, your data is safe in Neon. The server will automatically wake up when someone visits the link.
