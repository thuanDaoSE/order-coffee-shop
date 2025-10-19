import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';

const LocationHandler = () => {
  const { user, login } = useAuth();
  const [isLocationRequested, setIsLocationRequested] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if (user && !user.address && !isLocationRequested) {
        setIsLocationRequested(true);

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });

          const { latitude, longitude } = position.coords;
          const locationService = await import('../services/locationService');
          const addresses = await locationService.locationService.searchAddress('', latitude, longitude);
          
          let addressString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          if (addresses.length > 0) {
            const address = addresses[0];
            addressString = address.display || address.address || addressString;
          }

          const response = await updateProfile({ address: addressString });
          if (response.data) {
            login(response.data);
          }
        } catch (error) {
          console.error('Location handling error:', error);
        }
      }
    };

    fetchLocation();
  }, [user, isLocationRequested, login]);

  // This is a background component, it doesn't render anything
  return null;
};

export default LocationHandler;
