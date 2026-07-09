<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Image Generator & Editor

A modern, powerful web application for generating and editing images using the latest **Gemini 2.5 Flash Image** model. This tool combines a sleek user interface with robust AI capabilities and seamless Google Photos integration.

## 🚀 Features

- **Text-to-Image Generation**: Create stunning images from descriptive prompts.
- **AI-Powered Image Editing**: Upload local images or import from Google Photos to edit them using natural language instructions.
- **Customizable Styles**: Choose from various artistic styles like Cinematic, Digital Art, Photographic, Anime, and more.
- **Flexible Aspect Ratios**: Support for Square (1:1), Landscape (4:3), Portrait (3:4), Wide (16:9), and Tall (9:16).
- **Google Photos Integration**: Connect your Google account to browse and import your photos directly into the editor.
- **Modern UI/UX**: Built with React 19, Tailwind CSS 4, and Framer Motion for a smooth, responsive experience.
- **Secure Authentication**: OAuth2 integration for Google Photos access.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Backend**: [Express](https://expressjs.com/), [Node.js](https://nodejs.org/)
- **AI Model**: [Gemini 2.5 Flash Image](https://ai.google.dev/) via `@google/genai`
- **Integrations**: [Google Photos API](https://developers.google.com/photos)

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v18 or later recommended)
- **Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/)
- **Google OAuth Credentials**: (Optional, for Google Photos integration) Set up a project in the [Google Cloud Console](https://console.cloud.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   SESSION_SECRET="your_session_secret"
   APP_URL="http://localhost:3000"
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📖 Usage

- **Generate**: Type a description in the input box and click "Send".
- **Edit**: Click the "+" button or the Google Photos icon to attach an image. Then describe the changes you want to make (e.g., "Change the background to a sunset").
- **Settings**: Use the sidebar to adjust the aspect ratio and artistic style before generating.
- **Download**: Hover over any generated image and click the download icon to save it.

## 📜 License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details (if applicable).
