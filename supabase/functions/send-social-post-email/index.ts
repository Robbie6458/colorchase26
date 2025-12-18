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
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const cloudinaryCloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const cloudinaryUploadPreset = Deno.env.get("CLOUDINARY_UPLOAD_PRESET");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const svg = generateInstagramSVG(colors, palette, yesterday);

    // Convert SVG to PNG via Cloudinary
    let pngBase64 = null;
    let attachmentFilename = `colorchase-palette-${dateStr}.svg`;
    let attachmentContent = svg;

    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      try {
        pngBase64 = await convertSvgToPngCloudinary(svg, cloudinaryCloudName, cloudinaryUploadPreset, dateStr);
        if (pngBase64) {
          attachmentFilename = `colorchase-palette-${dateStr}.png`;
          attachmentContent = pngBase64;
        }
      } catch (err) {
        console.warn('Cloudinary conversion failed, falling back to SVG:', err);
      }
    }

    // Get the email to send to (you can customize this)
    const toEmail = Deno.env.get("SOCIAL_POST_EMAIL") || "colorchase@example.com";

    // Create email HTML with embedded SVG
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Today's ColorChase Social Post</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); border: 1px solid #475569;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 10px 0; text-align: center;">🎨 Today's ColorChase Post</h1>
            <p style="color: #cbd5e1; font-size: 14px; text-align: center; margin: 0 0 20px 0;">Yesterday's palette formatted for Instagram</p>
            
            <!-- SVG Preview -->
            <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #334155;">
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; text-align: center;">
                📎 Your palette image is attached as SVG
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                <strong>Quick convert to PNG:</strong><br>
                1. Open the attachment<br>
                2. Right-click → Save As<br>
                3. Upload to <a href="https://ezgif.com/image-to-data" style="color: #a78bfa;">ezgif.com</a> (drag & drop converter)<br>
                4. Download as PNG
              </p>
            </div>

            <!-- Caption -->
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #a78bfa; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Caption for Instagram</h3>
              <p style="color: #e2e8f0; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap; word-break: break-word;">
                ${escapeHtml(caption)}
              </p>
            </div>

            <!-- Instructions -->
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #334155;">
              <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px 0;">
                <strong>📱 How to post:</strong>
              </p>
              <ol style="color: #94a3b8; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Right-click the image above and save it</li>
                <li>Post to Instagram with the caption provided</li>
                <li>Or use Zapier/n8n to automate posting</li>
              </ol>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ColorChase. <a href="https://colorchasegame.com" style="color: #a78bfa; text-decoration: none;">Visit ColorChase</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend with SVG attachment
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'ColorChase <noreply@colorchasegame.com>',
        to: [toEmail],
        subject: `🎨 Today's ColorChase Social Post - ${formatDate(yesterday)}`,
        html: emailHtml,
        attachments: [
          {
            filename: attachmentFilename,
            content: attachmentContent,
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to send email:`, error);
      throw new Error(`Resend API error: ${error}`);
    }

    console.log(`Social post email sent for ${dateStr}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Social post email sent',
        date: dateStr,
        colors: colors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function generateCaption(palette: any, colors: string[], date: Date): string {
  const hexCodes = colors.map((c: string) => c.toUpperCase()).join(' • ');
  const formattedDate = formatDate(date);
  
  return `✨ Yesterday's ColorChase palette was absolutely stunning!

🎨 ${palette.name || 'Palette of the Day'}
${hexCodes}

ColorChase is a daily color-matching puzzle that challenges your eye for design. Every day brings a new palette to recreate!

🔥 Test your color skills today at colorchase.app

#ColorChase #ColorPalette #DailyChallenge #DesignGame #ColorTheory #${formattedDate.split(' ')[0].toLowerCase()}`;
}

function generateInstagramSVG(colors: string[], palette: any, date: Date): string {
  // Instagram portrait: 1080x1440, optimized for high-quality PNG
  const width = 1080;
  const height = 1440;
  const formattedDate = formatDate(date);

  // Create large color blocks for the swatches
  const blockHeight = 280;
  const blockWidth = width / colors.length;

  const colorBlocks = colors.map((color: string, i: number) => `
    <rect x="${i * blockWidth}" y="0" width="${blockWidth}" height="${blockHeight}" fill="${color}"/>
  `).join('\n');

  // Hex codes overlay on each color
  const hexTexts = colors.map((color: string, i: number) => `
    <text x="${i * blockWidth + blockWidth / 2}" y="${blockHeight / 2 + 20}" 
          text-anchor="middle" font-family="'Courier New', monospace" font-size="36" font-weight="900" 
          fill="white" letter-spacing="3" text-shadow="0 2px 4px rgba(0,0,0,0.5)"
          style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6))">
      ${color.toUpperCase()}
    </text>
  `).join('\n');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <style>
        .title { font-family: 'Arial Black', sans-serif; font-weight: 900; font-size: 56px; fill: white; letter-spacing: 2px; }
        .date { font-family: Arial, sans-serif; font-weight: 700; font-size: 24px; fill: rgba(255,255,255,0.95); }
        .cta { font-family: Arial, sans-serif; font-weight: 700; font-size: 28px; fill: white; }
      </style>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0a0e27;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1a1f3a;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

    <!-- Color Blocks Section -->
    ${colorBlocks}

    <!-- Hex Code Overlays -->
    ${hexTexts}

    <!-- Info Section -->
    <g>
      <!-- Background for info -->
      <rect x="0" y="${blockHeight}" width="${width}" height="${height - blockHeight}" fill="url(#bgGradient)" opacity="0.95"/>
      
      <!-- Title -->
      <text x="${width / 2}" y="${blockHeight + 120}" text-anchor="middle" class="title">Yesterday's</text>
      <text x="${width / 2}" y="${blockHeight + 180}" text-anchor="middle" class="title">Palette</text>
      
      <!-- Date -->
      <text x="${width / 2}" y="${blockHeight + 240}" text-anchor="middle" class="date">${formattedDate}</text>
      
      <!-- Challenge Text -->
      <text x="${width / 2}" y="${blockHeight + 640}" text-anchor="middle" class="cta">Can you match</text>
      <text x="${width / 2}" y="${blockHeight + 680}" text-anchor="middle" class="cta">these colors?</text>
      
      <!-- CTA -->
      <rect x="120" y="${blockHeight + 750}" width="${width - 240}" height="80" fill="rgba(139, 92, 246, 0.25)" rx="20" stroke="rgba(139, 92, 246, 0.8)" stroke-width="3"/>
      <text x="${width / 2}" y="${blockHeight + 810}" text-anchor="middle" style="font-family: Arial, sans-serif; font-weight: 900; font-size: 32px; fill: #a78bfa;">🔥 colorchase.app</text>
    </g>
  </svg>`;
}

async function convertSvgToPngCloudinary(svgContent: string, cloudName: string, uploadPreset: string, dateStr: string): Promise<string | null> {
  try {
    console.log('Converting SVG to PNG via Cloudinary...');

    // Step 1: Upload SVG to Cloudinary with timestamp to avoid caching
    const timestamp = Date.now();
    const filename = `colorchase-${dateStr}-${timestamp}.svg`;
    const formData = new FormData();
    const encoder = new TextEncoder();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    
    formData.append('file', svgBlob, filename);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'image');
    formData.append('public_id', `colorchase-palette-${dateStr}-${timestamp}`);
    formData.append('tags', 'social-post,colorchase');

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('Cloudinary upload failed:', error);
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('Upload successful, public_id:', uploadData.public_id);

    // Step 2: Transform SVG to PNG using Cloudinary URL with high quality settings
    const publicId = uploadData.public_id;
    const pngUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_92,w_1080,h_1440,c_fill,dpr_auto/${publicId}.png`;
    
    console.log('Fetching PNG from:', pngUrl);

    // Step 3: Download the PNG
    const pngResponse = await fetch(pngUrl);
    if (!pngResponse.ok) {
      throw new Error(`Failed to fetch PNG: ${pngResponse.status}`);
    }

    // Step 4: Convert to base64
    const buffer = await pngResponse.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Manual base64 encoding for Deno
    let base64 = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i];
      const b2 = bytes[i + 1];
      const b3 = bytes[i + 2];
      base64 += chars[b1 >> 2];
      base64 += chars[((b1 & 3) << 4) | (b2 >> 4)];
      base64 += b2 === undefined ? '==' : chars[((b2 & 15) << 2) | (b3 >> 6)];
      base64 += b3 === undefined ? '=' : chars[b3 & 63];
    }

    console.log('PNG conversion successful, base64 length:', base64.length);
    return base64;
  } catch (err) {
    console.error('SVG to PNG conversion error:', err);
    return null;
  }
}
