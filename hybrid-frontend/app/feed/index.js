// src/components/Feed.jsx
import { useEffect, useState } from 'react';
import { Box, Button, VStack, Text, Input, Select, Image } from '@chakra-ui/react';
import api from '../api'; // Instancia de Axios
import * as ActionCable from '@rails/actioncable';

const Feed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ type: null, value: null });
  const [error, setError] = useState('');
  const cableConnection = ActionCable.createConsumer("ws://localhost:3001/cable");

  useEffect(() => {
    // Cargar publicaciones iniciales del feed
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/v1/feed`, { headers: { Authorization: `Bearer ${user.token}` } });
        setPosts(response.data);
      } catch (err) {
        setError('Error al cargar las publicaciones.');
      }
    };
    fetchPosts();

    // Configurar la conexión WebSocket para recibir actualizaciones en tiempo real
    const subscription = cableConnection.subscriptions.create(
      { channel: 'FeedChannel', user_id: user.id },
      {
        connected() {
          console.log('Conectado al FeedChannel.');
        },
        received(data) {
          if (filter.type && filter.value) {
            // Aplicar filtro a las publicaciones en tiempo real
            if (data.post[filter.type] === filter.value) {
              setPosts((prevPosts) => [data.post, ...prevPosts]);
            }
          } else {
            setPosts((prevPosts) => [data.post, ...prevPosts]);
          }
        },
        rejected() {
          setError('No se pudo autenticar la conexión.');
        },
      }
    );

    // Limpiar la conexión WebSocket al desmontar el componente
    return () => {
      subscription.unsubscribe();
    };
  }, [filter, user.id, user.token]);

  const handleFilterChange = (type, value) => {
    if (value === '') {
      setFilter({ type: null, value: null });
    } else {
      setFilter({ type, value });
    }
  };

  return (
    <Box p={4} maxW="lg" borderWidth="1px" borderRadius="lg" overflowY="auto">
      <Text fontSize="xl" mb={4}>
        <b>Feed</b>: Actividad en tiempo real
      </Text>

      {/* Filtro de publicaciones */}
      <Select
        placeholder="Filtrar por"
        mb={4}
        onChange={(e) => handleFilterChange('type', e.target.value)}
      >
        <option value="friend">Amistad</option>
        <option value="bar">Bar</option>
        <option value="country">País</option>
        <option value="beer">Cerveza</option>
      </Select>
      <Input
        placeholder="Especifica el valor para filtrar"
        mb={4}
        onChange={(e) => handleFilterChange(filter.type, e.target.value)}
      />

      {/* Publicaciones */}
      <VStack spacing={4} align="stretch">
        {posts.map((post) => (
          <Box key={post.id} p={3} bg="gray.100" borderRadius="md">
            <Text fontWeight="bold">{post.author.nickname} publicó:</Text>
            <Text>{post.content}</Text>
            {post.image && <Image src={post.image} alt="Imagen del evento" />}
            <Button
              mt={2}
              colorScheme="teal"
              onClick={() => (window.location.href = `/event/${post.event_id}`)}
            >
              Ver más
            </Button>
          </Box>
        ))}
      </VStack>

      {error && <Text color="red.500" mt={2}>{error}</Text>}
    </Box>
  );
};

export default Feed;
