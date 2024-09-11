import { useEffect, useRef, useState } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
// import { useLoadGMapsLibraries } from './useLoadGMapsLibraries'; // Hook para cargar las librerías
// import { MAPS_LIBRARY, MARKER_LIBRARY } from './constants'; // Constantes utilizadas
// Constantes para las bibliotecas de Google Maps
const MAPS_LIBRARY = 'maps';
const MARKER_LIBRARY = 'marker';
const GOOGLE_MAPS_LIBRARIES = [MAPS_LIBRARY, MARKER_LIBRARY];

// Hook para cargar las librerías de Google Maps
const useLoadGMapsLibraries = () => {
  const [libraries, setLibraries] = useState();

  useEffect(() => {
    const loader = new Loader({
      // apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      apiKey: 'AIzaSyDSwzAGB40l_dEfS2GmiDerTrn5WrLi4Hg',
      version: 'weekly',
    });

    const promises = GOOGLE_MAPS_LIBRARIES.map((name) =>
      loader.importLibrary(name).then((lib) => [name, lib])
    );

    Promise.all(promises).then((libs) =>
      setLibraries(Object.fromEntries(libs))
    );
  }, []);

  return libraries;
};
const BarSearch = () => {
  const [bars, setBars] = useState([]); // Estado para almacenar los bares
  const [userLocation, setUserLocation] = useState(null); // Estado para almacenar la ubicación del usuario
  const libraries = useLoadGMapsLibraries();
  const markerCluster = useRef();
  const mapNodeRef = useRef();
  const mapRef = useRef();

  // Obtener la ubicación actual del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error obteniendo la ubicación del usuario', error);
          // Default fallback: centro genérico si no se puede obtener la ubicación
          setUserLocation({ lat: -33.403818, lng: -70.506816 });
        }
      );
    } else {
      // Default fallback: si el navegador no soporta Geolocation
      setUserLocation({ lat: -33.403818, lng: -70.506816 });
    }
  }, []);

  // Cargar la lista de bares desde el backend
  useEffect(() => {
    axios
      .get('/api/v1/bars')
      // .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/bars`)
      .then((response) => {
        // Accede a los bares dentro de la clave "bars"
        // console.log('Fetched bars:', response.data);
        const barsData = Array.isArray(response.data.bars) ? response.data.bars : [];
        setBars(barsData);
        console.log(barsData);
      })
      .catch((error) => {
        console.error('Error al cargar los bares', error);
        setBars([]); // En caso de error, asegúrate de que sea un arreglo vacío
      });
  }, []);
  

  // Inicializar el mapa y los marcadores una vez que se cargan las librerías y la ubicación del usuario
  useEffect(() => {
    if (!libraries || !userLocation) {
      return;
    }

    const { Map } = libraries[MAPS_LIBRARY];
    mapRef.current = new Map(mapNodeRef.current, {
      mapId: 'BARS_MAP_ID', // Reemplaza esto con tu propio ID de mapa
      center: userLocation,
      zoom: 15,
    });

    const { AdvancedMarkerElement: Marker } = libraries[MARKER_LIBRARY];
    const markers = bars.map((bar) => new Marker({
      position: { lat: bar.latitude, lng: bar.longitude },
      title: bar.name,
    }));

    markerCluster.current = new MarkerClusterer({
      map: mapRef.current,
      markers,
    });
  }, [libraries, userLocation, bars]);

  if (!libraries || !userLocation) {
    return <h1>Cargando. . .</h1>;
  }

  return <div ref={mapNodeRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default BarSearch;
