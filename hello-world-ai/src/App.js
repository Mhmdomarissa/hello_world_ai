import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const codeSnippets = {
    "hello world in python": "print('Hello, world!')",
    "create a react component": `
import React from 'react';

function MyComponent() {
  return (
    <div>
      Hello, World!
    </div>
  );
}

export default MyComponent;
    `,
    // Add more snippets as needed
  };

  const gitCommands = {
    "git init": "This command initializes a new Git repository.",
    "git clone": "This command clones an existing Git repository into a local directory.",
    "git status": "This command shows the status of changes as untracked, modified, or staged.",
    // Add more Git commands as needed
  };

  const fetchMDNDocumentation = async (query) => {
    try {
      const response = await axios.get(`https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`);
      if (response.data.documents && response.data.documents.length > 0) {
        return `Here’s what I found on MDN: ${response.data.documents[0].summary}\nLink: ${response.data.documents[0].url}`;
      } else {
        return "Sorry, I couldn’t find anything on that topic.";
      }
    } catch (error) {
      console.error('Error fetching documentation:', error);
      return "Sorry, I encountered an error while fetching the documentation.";
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() !== '') {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');

      // Check for Code Snippet Suggestions
      const snippet = codeSnippets[input.toLowerCase()];
      if (snippet) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: snippet, sender: 'bot' }
        ]);
        return;
      }

      // Check for Git Command Suggestions
      const gitHelp = gitCommands[input.toLowerCase()];
      if (gitHelp) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: gitHelp, sender: 'bot' }
        ]);
        return;
      }

      // Check for Documentation Lookup
      if (input.toLowerCase().startsWith("docs")) {
        const query = input.replace("docs", "").trim();
        const docResult = await fetchMDNDocumentation(query);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: docResult, sender: 'bot' }
        ]);
        return;
      }

      // Call OpenAI API if no match is found
      try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
          model: 'text-davinci-003',
          prompt: input,
          max_tokens: 150,
        }, {
          headers: {
            'Authorization': `Bearer YOUR_API_KEY`, // Replace YOUR_API_KEY with your actual API key
            'Content-Type': 'application/json',
          },
        });

        setMessages(prevMessages => [
          ...prevMessages,
          { text: response.data.choices[0].text, sender: 'bot' }
        ]);
      } catch (error) {
        console.error('Error fetching AI response:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Error: Could not reach AI service. (${error.message})`, sender: 'bot' }
        ]);
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      height="100vh"
      p={2}
      bgcolor="#f5f5f5"
    >
      <Box>
        <Typography variant="h4" gutterBottom>
          Hello-World-AI
        </Typography>
      </Box>
      <Box flexGrow={1} overflow="auto" p={2} bgcolor="#fff" borderRadius={4}>
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
              bgcolor={message.sender === 'user' ? '#1976d2' : '#eeeeee'}
              color={message.sender === 'user' ? '#fff' : '#000'}
              borderRadius={4}
            >
              {message.text}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" mt={2}>
        <TextField
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default App;
