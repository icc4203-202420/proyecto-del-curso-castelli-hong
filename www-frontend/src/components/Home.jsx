import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, Button, Paper } from '@mui/material';

function Home() {
  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', margin: 0 }}>
      <img
        src="/images/IMG_6137.jpg"
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2,
          margin: 0,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo negro con opacidad 60%
        zIndex: -1,
      }} />
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 1,
        textAlign: 'center',
        padding: '20px', // Añadir padding para evitar que el contenido toque los bordes
      }}>
        <Paper elevation={3} sx={{
          padding: 4,
          backgroundColor: 'transparent', // Fondo transparente para ver el negro debajo
          color: '#fff', // Color del texto blanco
          maxWidth: 'md', // Ajusta el tamaño del contenedor si es necesario
        }}>
          <Typography variant="h2" gutterBottom>
            Welcome to Beer Explorer!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Select an option below to get started:
          </Typography>
          <List>
            <ListItem>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#c28744', color: '#fff', '&:hover': { backgroundColor: '#a2743c' } }}
                component={Link}
                to="/beers"
                fullWidth
              >
                Beers
              </Button>
            </ListItem>
            <ListItem>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#c28744', color: '#fff', '&:hover': { backgroundColor: '#a2743c' } }}
                component={Link}
                to="/bars"
                fullWidth
              >
                Bars
              </Button>
            </ListItem>
            <ListItem>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#c28744', color: '#fff', '&:hover': { backgroundColor: '#a2743c' } }}
                component={Link}
                to="/bars/:id/events"
                fullWidth
              >
                Events
              </Button>
            </ListItem>
            <ListItem>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#c28744', color: '#fff', '&:hover': { backgroundColor: '#a2743c' } }}
                component={Link}
                to="/users"
                fullWidth
              >
                Users
              </Button>
            </ListItem>
          </List>
        </Paper>
      </div>
    </div>
  );
}

export default Home;
