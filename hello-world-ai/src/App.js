import React, { useState } from 'react';
import { Box, TextField, Button, Typography, IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import axios from 'axios';
import SnippetManager from './SnippetManager';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const saveSnippet = (name, content) => {
    localStorage.setItem(name, content);
    setMessages(prevMessages => [
      ...prevMessages,
      { text: `Snippet "${name}" saved!`, sender: 'bot' }
    ]);
  };

  const fetchSnippet = (name) => {
    const snippet = localStorage.getItem(name);
    if (snippet) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: snippet, sender: 'bot' }
      ]);
    } else {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `No snippet found with the name "${name}".`, sender: 'bot' }
      ]);
    }
  };

  const analyzeCodeSnippet = async (snippet) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/completions', {
        model: 'text-davinci-003',
        prompt: `Review this code and provide suggestions for improvements, including performance optimization, readability, and potential bug fixes:\n\n${snippet}`,
        max_tokens: 300,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Use the environment variable for API key
          'Content-Type': 'application/json',
        },
      });

      setMessages(prevMessages => [
        ...prevMessages,
        { text: response.data.choices[0].text.trim(), sender: 'bot' }
      ]);
    } catch (error) {
      console.error('Error analyzing code snippet:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Error: Could not analyze the code snippet. (${error.message})`, sender: 'bot' }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') {
      setMessages([...messages, { text: "Please enter a valid message.", sender: 'bot' }]);
      return;
    }

    if (input.length > 500) {
      setMessages([...messages, { text: "Message too long. Please shorten your message.", sender: 'bot' }]);
      return;
    }

    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');

    // Check for snippet save command
    if (input.toLowerCase().startsWith("save snippet")) {
      const [_, name, ...contentArr] = input.split(" ");
      const content = contentArr.join(" ");
      saveSnippet(name, content);
      return;
    }

    // Check for snippet fetch command
    if (input.toLowerCase().startsWith("fetch snippet")) {
      const name = input.replace("fetch snippet", "").trim();
      fetchSnippet(name);
      return;
    }

    // Check for code review command
    if (input.toLowerCase().startsWith("review code")) {
      const codeSnippet = input.replace("review code", "").trim();
      analyzeCodeSnippet(codeSnippet);
      return;
    }

    // Call OpenAI API if no command matches
    try {
      const response = await axios.post('https://api.openai.com/v1/completions', {
        model: 'text-davinci-003',
        prompt: input,
        max_tokens: 150,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Use the environment variable for API key
          'Content-Type': 'application/json',
        },
      });

      setMessages(prevMessages => [
        ...prevMessages,
        { text: response.data.choices[0].text.trim(), sender: 'bot' }
      ]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Error: Could not reach AI service. (${error.message})`, sender: 'bot' }
      ]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100vh"
        p={2}
        bgcolor={darkMode ? '#121212' : '#f5f5f5'}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h4" gutterBottom>
            Hello-World-AI
          </Typography>
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Box flexGrow={1} overflow="auto" p={2} bgcolor={darkMode ? '#333' : '#fff'} borderRadius={4}>
          {messages.map((message, index) => (
            <Box
              key={index}
              mb={2}
              display="flex"
              justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            >
              <Typography
                variant="body1"
                p={2}
                bgcolor={message.sender === 'user' ? (darkMode ? '#1976d2' : '#1976d2') : (darkMode ? '#555' : '#eeeeee')}
                color={message.sender === 'user' ? '#fff' : '#000'}
                borderRadius={4}
              >
                {message.text}
              </Typography>
            </Box>
          ))}
        </Box>
        <SnippetManager />
        <Box display="flex" mt={2}>
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            InputProps={{
              style: { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' }
            }}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
            Send
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
