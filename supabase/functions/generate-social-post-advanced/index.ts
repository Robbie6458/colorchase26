import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const bufferAccessToken = Deno.env.get("BUFFER_ACCESS_TOKEN"); // Optional
    const cloudinaryCloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME"); // Optional
    const cloudinaryUploadPreset = Deno.env.get("CLOUDINARY_UPLOAD_PRESET"); // Optional
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    const body = await req.json().catch(() => ({}));
    const autoPost = body.autoPost === true && bufferAccessToken;

    // Get yesterday's palette
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const dateStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`;

    const { data: palette, error } = await supabase
      .from('daily_palettes')
      .select('*')
      .eq('date', dateStr)
      .single();

    if (error || !palette) {
      throw new Error(`Palette not found for ${dateStr}`);
    }

    const colors = palette.colors || [];
    const caption = generateCaption(palette, colors, yesterday);
    const svg = generateSVG(colors, palette, yesterday);

    // If Cloudinary is configured, convert SVG to PNG
    let imageUrl = null;
    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      imageUrl = await uploadToCloudinary(svg, cloudinaryCloudName, cloudinaryUploadPreset);
    }

    // If Buffer is configured and autoPost is true, post to social media
    let bufferResponse = null;
    if (autoPost && imageUrl) {
      bufferResponse = await postToBuffer(bufferAccessToken!, caption, imageUrl);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: dateStr,
        svg: svg,
        caption: caption,
        colors: colors,
        palette_name: palette.palette_name,
        imageUrl: imageUrl,
        posted: !!bufferResponse,
        bufferResponse: bufferResponse,
        setup: {
          cloudinary: !!cloudinaryCloudName && !!cloudinaryUploadPreset,
          buffer: !!bufferAccessToken,
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateSVG(colors: string[], palette: any, date: Date): string {
  const colorCount = colors.length;
  const colorWidth = 1200 / colorCount;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font-family: 'Arial Black', sans-serif; font-weight: 900; font-size: 48px; fill: white; }
      .subtitle { font-family: Arial, sans-serif; font-weight: 600; font-size: 24px; fill: rgba(255,255,255,0.95); }
      .hex { font-family: 'Courier New', monospace; font-weight: 700; font-size: 19px; fill: white; letter-spacing: 1px; }
      .date { font-family: Arial, sans-serif; font-weight: 700; font-size: 20px; fill: rgba(255,255,255,0.85); }
    </style>
  </defs>
  
  <!-- Background colors (full bleed) -->
  ${colors.map((color: string, i: number) => 
    `<rect x="${i * colorWidth}" y="0" width="${colorWidth}" height="628" fill="${color}" />`
  ).join('\n  ')}
  
  <!-- Dark overlay for text readability -->
  <rect x="0" y="0" width="1200" height="628" fill="url(#gradient)" opacity="0.5" />
  
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.6" />
    </linearGradient>
  </defs>
  
  <!-- Content -->
  <g>
    <!-- Title with shadow -->
    <text x="602" y="202" text-anchor="middle" class="title" fill="rgba(0,0,0,0.3)">Yesterday's ColorChase</text>
    <text x="600" y="200" text-anchor="middle" class="title">Yesterday's ColorChase</text>
    
    <!-- Date -->
    <text x="600" y="250" text-anchor="middle" class="date">${formatDate(date)}</text>
    
    <!-- Palette name -->
    <text x="600" y="310" text-anchor="middle" class="subtitle">${palette.palette_name || 'Daily Palette'}</text>
    
    <!-- Hex codes with background -->
    <g transform="translate(600, 370)">
      ${colors.map((color: string, i: number) => {
        const totalWidth = colors.length * 145;
        const startX = -totalWidth / 2;
        const x = startX + i * 145 + 72.5;
        return `
        <rect x="${x - 60}" y="-25" width="120" height="45" rx="8" fill="rgba(0,0,0,0.3)" />
        <text x="${x}" y="5" text-anchor="middle" class="hex">${color}</text>`;
      }).join('\n      ')}
    </g>
    
    <!-- Call to action -->
    <text x="600" y="480" text-anchor="middle" class="subtitle" style="font-size: 28px;">Can you match today's colors?</text>
    
    <!-- Logo/URL with emoji -->
    <text x="600" y="560" text-anchor="middle" class="title" style="font-size: 40px;">🎨 colorchasegame.com</text>
  </g>
</svg>`;
}

async function uploadToCloudinary(svg: string, cloudName: string, uploadPreset: string): Promise<string> {
  // Encode SVG as base64
  const encoder = new TextEncoder();
  const data = encoder.encode(svg);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', dataUrl);
  formData.append('upload_preset', uploadPreset);
  formData.append('format', 'png');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${await response.text()}`);
  }

  const result = await response.json();
  return result.secure_url;
}

async function postToBuffer(accessToken: string, text: string, imageUrl: string): Promise<any> {
  // Get Buffer profiles (you'll need to configure which profiles to post to)
  const profilesResponse = await fetch('https://api.bufferapp.com/1/profiles.json', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!profilesResponse.ok) {
    throw new Error(`Buffer profiles fetch failed: ${await profilesResponse.text()}`);
  }

  const profiles = await profilesResponse.json();
  
  // Post to each profile (or filter to specific ones)
  const postPromises = profiles.map(async (profile: any) => {
    const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'profile_ids[]': profile.id,
        'text': text,
        'media[photo]': imageUrl,
        'shorten': 'false',
      }),
    });

    return response.json();
  });

  return Promise.all(postPromises);
}

function formatDate(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function generateCaption(palette: any, colors: string[], date: Date): string {
  const hexCodes = colors.join(' • ');
  const paletteName = palette.palette_name || 'Daily Palette';
  
  const captions = [
    `✨ Yesterday's ColorChase palette was absolutely stunning!\n\n🎨 ${paletteName}\n${hexCodes}\n\nColorChase is a daily color-matching puzzle that challenges your eye for design. Every day brings a new palette to recreate!\n\n🔥 Test your color skills today at colorchasegame.com\n\n#ColorChase #ColorPalette #DailyChallenge #DesignGame #ColorTheory`,
    
    `🎨 Did you solve yesterday's palette?\n\n"${paletteName}"\n${hexCodes}\n\nColorChase is your daily dose of color training. Perfect for designers, artists, and anyone who loves beautiful palettes!\n\n🎯 Play today's challenge: colorchasegame.com\n\n#ColorChallenge #PaletteDesign #DailyPuzzle #ColorMatching #DesignInspiration`,
    
    `Another beautiful palette in the books! 🌈\n\nYesterday's ${paletteName}:\n${hexCodes}\n\nLove colors? You'll love ColorChase - a daily game that sharpens your eye for design while having fun!\n\n👉 Play now: colorchasegame.com\n\n#ColorGame #DesignDaily #PaletteInspiration #ColorHarmony #DesignChallenge`
  ];
  
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return captions[dayOfYear % captions.length];
}
