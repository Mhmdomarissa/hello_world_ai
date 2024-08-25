import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';

const SnippetManager = () => {
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    // Load all snippets from localStorage
    const keys = Object.keys(localStorage);
    const snippetList = keys.map(key => ({ name: key, content: localStorage.getItem(key) }));
    setSnippets(snippetList);
  }, []);

  const deleteSnippet = (name) => {
    localStorage.removeItem(name);
    setSnippets(snippets.filter(snippet => snippet.name !== name));
  };

  return (
    <Box p={2} bgcolor="#eeeeee" borderRadius={4} mt={2}>
      <Typography variant="h5" gutterBottom>
        Snippet Manager
      </Typography>
      <List>
        {snippets.map((snippet, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={snippet.name}
              secondary={snippet.content}
            />
            <Button variant="outlined" color="secondary" onClick={() => deleteSnippet(snippet.name)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SnippetManager;
