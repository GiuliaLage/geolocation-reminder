import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import Geolocation from 'react-native-geolocation-service';

export interface Location {
  latitude: number;
  longitude: number; 
}

export interface Route {
  duration: number;
  distance: number;
}


const PUBLIC_ACCESS_TOKEN_MAPBOX = 'pk.eyJ1IjoiZ2l1bGlhbGFnZSIsImEiOiJjbDNqM3hleWkwMDlnM2pwdXVlYjNlYnRzIn0.y0o6xCS4UP-WNRcA_oFOhg';


const App = () => {
  const isDarkMode = useColorScheme() === 'dark';


  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [destination, setDestination] = useState<Location>({latitude: -19.985477731944442, longitude: -44.1939422732965});

  const [targetDestinationNotification] = useState(2000);

  const [currentPosition, setCurrentPosition] = useState<Location>({latitude: 0, longitude: 0});
  
  const requestUserGeoLocationPermission = async (): Promise<boolean> =>{
    const userHasGrantedGeoLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
   
    if(!userHasGrantedGeoLocation){
      const userGeoLocationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if(userGeoLocationPermission === PermissionsAndroid.RESULTS.GRANTED){
         return true;
      }else{
        return false;
      }
    }

    return userHasGrantedGeoLocation;
  } 

  const watchUserPosition = async () =>{
     const position =  Geolocation.watchPosition(
       async (position) =>{
        const { coords } = position;  
        setCurrentPosition(
            {
              latitude: Number(coords.latitude.toFixed(4)), 
              longitude: Number(coords.longitude.toFixed(4))
          });
        getDistanceFromDestination(coords);
     },(error) =>{
       console.log('error', error);
     },{ distanceFilter: 100, accuracy: {
       android: 'high', 
       
     }});
     return position;
  }

  const getDistanceFromDestination = async (currentPosition: Location) =>{
    try{
      
      //TODO: verificar se a distancia atual é diferente da de destino  
      
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${currentPosition.longitude},${currentPosition.latitude};${destination.longitude},${destination.latitude}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${PUBLIC_ACCESS_TOKEN_MAPBOX}`
      );
      const routes = await response.json();

      let smallDistance = 0;
      routes.routes.forEach((route: Route) => {
        if(smallDistance === 0) smallDistance = route.distance;
        
        if(route.distance < smallDistance) smallDistance = route.distance;
      });

      if(smallDistance <= targetDestinationNotification){
         Alert.alert('VOCÊ CHEGOU NO PONTO DE LEMBRETE');
      }

  } catch (error) {
     console.error(error);
  }    
  } 

  useEffect(function getUserLocationTrigger(){
     const getuserLocation = async () =>{
        const locationGrant = await requestUserGeoLocationPermission();
        if(locationGrant){
           watchUserPosition();  
        }
      }
      getuserLocation();
  },[])


  return ( 
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}> 
          <Text>Localização Atual: </Text>
          <Text>latitude: {currentPosition.latitude} </Text>
          <Text>longitude: {currentPosition.longitude} </Text> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
