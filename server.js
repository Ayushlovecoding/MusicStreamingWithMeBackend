// server.js - UPDATED CORS configuration

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// ✅ FIXED: Updated CORS to allow Netlify frontend
const allowedOrigins = [
  'https://musicstreamingbyayush-sharma.netlify.app',
  'http://localhost:5173', // for local development
  'http://localhost:3000'
];

const corsOptions = {
  origin: function(origin, callback){
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

// JioSaavn proxy routes
const jiosaavnRouter = require('./routes/jiosaavnRoutes');
app.use('/api/jiosaavn', jiosaavnRouter);

// ... rest of your server.js code
import { createContext, useEffect, useRef, useState } from "react";
import { songsData } from "../assets/frontend-assets/assets";
import API_BASE_URL from '../config/api';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [track, setTrack] = useState(songsData[0]);
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 },
  });

  const playWithId = async (id) => {
    const song = songsData.find((item) => item.id === id);
    if (song) {
      setTrack(song);
      await audioRef.current.play();
      setPlayStatus(true);
    }
  };

  // ✅ FIXED: Play remote song with correct proxy URL
  const playRemote = async (songInfo) => {
    try {
      console.log('Playing remote song:', songInfo);

      const remoteTrack = {
        id: 'remote-' + Date.now(),
        name: songInfo.name || 'Unknown Song',
        desc: songInfo.artist || 'Unknown Artist',
        image: songInfo.image || '/placeholder-album.png',
        file: songInfo.streamUrl,
        source: 'remote'
      };

      setTrack(remoteTrack);
      audioRef.current.pause();
      
      // Try direct URL first
      audioRef.current.src = songInfo.streamUrl;
      audioRef.current.crossOrigin = 'anonymous';
      
      try {
        await audioRef.current.play();
        setPlayStatus(true);
      } catch (error) {
        console.log('Direct play failed, trying proxy...');
        
        // ✅ FIXED: Use correct backend URL for proxy
        const proxyUrl = `${API_BASE_URL}/api/jiosaavn/stream?url=${encodeURIComponent(songInfo.streamUrl)}`;
        audioRef.current.src = proxyUrl;
        
        await audioRef.current.play();
        setPlayStatus(true);
      }
      
    } catch (error) {
      console.error('Failed to play remote song:', error);
      alert('Failed to play this song. Please try another one.');
    }
  };

  const play = () => {
    audioRef.current.play();
    setPlayStatus(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setPlayStatus(false);
  };

  const previous = async () => {
    if (track.id > 0) {
      await playWithId(track.id - 1);
    }
  };

  const next = async () => {
    if (track.id < songsData.length - 1) {
      await playWithId(track.id + 1);
    }
  };

  const seekSong = async (e) => {
    const seekPosition = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration;
    audioRef.current.currentTime = seekPosition;
  };

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateTime = () => {
      if (audio.duration) {
        seekBar.current.style.width = Math.floor((audio.currentTime / audio.duration) * 100) + "%";
        
        setTime({
          currentTime: {
            second: Math.floor(audio.currentTime % 60),
            minute: Math.floor(audio.currentTime / 60),
          },
          totalTime: {
            second: Math.floor(audio.duration % 60),
            minute: Math.floor(audio.duration / 60),
          },
        });
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
    };
  }, []);

  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    playRemote,
    previous,
    next,
    seekSong,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;