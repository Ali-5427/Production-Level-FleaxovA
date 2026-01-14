export interface FileNode {
  type: 'file';
  name: string;
  content: string;
}

export interface FolderNode {
  type: 'folder';
  name: string;
  children: (FileNode | FolderNode)[];
}

export type ProjectNode = FolderNode | FileNode;

const clientPackageJson = `{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0"
  }
}`;

const serverPackageJson = `{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`;

const clientEnv = `VITE_API_BASE_URL=http://localhost:5000/api`;

const serverEnv = `PORT=5000
MONGO_URI=your_mongodb_connection_string`;

const serverJs = `require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes placeholder
app.get('/', (req, res) => {
  res.send('Fleaxova Server is running!');
});

// Example route placeholder:
// app.use('/api/users', require('./src/routes/userRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;

const clientAppJsx = `import './App.css';

function App() {
  return (
    <div>
      <h1>Fleaxova Client</h1>
      <p>React + Vite frontend is running!</p>
    </div>
  )
}

export default App
`;

const clientAppCss = `
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
`;


export const getProjectTemplate = (projectName: string): FolderNode => {
  return {
    type: 'folder',
    name: projectName,
    children: [
      {
        type: 'folder',
        name: 'client',
        children: [
          {
            type: 'folder',
            name: 'src',
            children: [
              { type: 'folder', name: 'components', children: [] },
              { type: 'folder', name: 'pages', children: [] },
              { type: 'folder', name: 'services', children: [] },
              { type: 'folder', name: 'context', children: [] },
              { type: 'file', name: 'App.jsx', content: clientAppJsx },
              { type: 'file', name: 'App.css', content: clientAppCss },
            ],
          },
          { type: 'file', name: 'package.json', content: clientPackageJson },
          { type: 'file', name: '.env', content: clientEnv },
        ],
      },
      {
        type: 'folder',
        name: 'server',
        children: [
          {
            type: 'folder',
            name: 'src',
            children: [
              { type: 'folder', name: 'config', children: [] },
              { type: 'folder', name: 'controllers', children: [] },
              { type: 'folder', name: 'middleware', children: [] },
              { type: 'folder', name: 'routes', children: [] },
            ],
          },
          { type: 'file', name: 'server.js', content: serverJs },
          { type: 'file', name: 'package.json', content: serverPackageJson },
          { type: 'file', name: '.env', content: serverEnv },
        ],
      },
    ],
  };
};
