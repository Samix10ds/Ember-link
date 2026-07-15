// Bot Discord per Ember Link
// Legge la presenza (gioco/Spotify/stato) di chi è nel server e la scrive su Supabase.
// Il profilo pubblico si aggiorna in tempo reale senza ricaricare.
//
// Dove gira: Fly.io (gratis, sempre acceso, non va in sleep)

import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`✅ Bot connesso come ${client.user.tag}`);
});

client.on('presenceUpdate', async (_old, newPresence) => {
  if (!newPresence?.userId) return;

  const activities = (newPresence.activities || []).map(a => ({
    type: a.type,  // 0 = Playing, 2 = Listening, 4 = Custom Status
    name: a.name,
    details: a.details || null,
    state: a.state || null,
  }));

  // Se sta ascoltando Spotify, Discord lo espone come activity speciale
  const spotifyActivity = newPresence.activities?.find(a => a.name === 'Spotify' && a.type === 2);
  const spotify = spotifyActivity ? {
    song: spotifyActivity.details,
    artist: spotifyActivity.state,
    albumArt: spotifyActivity.assets?.largeImageURL ? spotifyActivity.assets.largeImageURL() : null,
  } : null;

  await supabase.from('discord_presence').upsert({
    discord_id: newPresence.userId,
    status: newPresence.status,
    activities,
    spotify,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'discord_id' });
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Express server per gli health check di Fly.io
// Fly.io ha bisogno di una porta in ascolto per sapere che l'app è viva
const app = express();
app.get('/', (_, res) => res.send('Ember Link bot online ✅'));
app.get('/health', (_, res) => res.json({ status: 'ok', bot: client.user?.tag || 'connecting...' }));
app.listen(process.env.PORT || 3000);
