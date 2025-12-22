import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCanvas } from "https://deno.land/x/canvas@1.4.1/mod.ts";

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
    
    // Generate PNG image using canvas (same method as share button)
    const pngBuffer = await generatePaletteImagePNG(
      colors,
      palette.scheme,
      dateStr,
      undefined, // won status - not available for daily palettes
      {
        palette_name: palette.palette_name,
        palette_description: palette.palette_description,
        best_used_for: palette.best_used_for
      }
    );

    // Convert buffer to base64 for email attachment
    const pngBase64 = arrayBufferToBase64(pngBuffer);

    // Generate caption with metadata
    const caption = generateCaption(
      colors,
      dateStr,
      palette.palette_name,
      palette.palette_description,
      palette.best_used_for
    );

    // Get the email to send to
    const toEmail = Deno.env.get("SOCIAL_POST_EMAIL") || "colorchase@example.com";

    // Create email HTML
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
            
            <!-- PNG Attachment Notice -->
            <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #334155;">
              <p style="color: #cbd5e1; font-size: 14px; margin: 0; text-align: center;">
                📎 Your palette image is attached as PNG
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
                <li>Download the attached PNG image</li>
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

    // Send email via Resend with PNG attachment
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
            filename: `colorchase-palette-${dateStr}.png`,
            content: pngBase64,
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

function generateCaption(
  colors: string[],
  dateStr: string,
  paletteName?: string,
  paletteDescription?: string,
  bestUsedFor?: string[]
): string {
  const hexCodes = colors.map((c: string) => c.toUpperCase()).join(' • ');
  const date = new Date(dateStr);
  const formattedDate = formatDate(date);
  
  let caption = '';
  
  // Opening with palette name if available
  if (paletteName) {
    caption += `✨ ${paletteName}\n\n`;
  } else {
    caption += `✨ Yesterday's ColorChase palette was absolutely stunning!\n\n`;
  }
  
  // Palette description if available
  if (paletteDescription) {
    caption += `${paletteDescription}\n\n`;
  }
  
  // Color codes
  caption += `🎨 ${hexCodes}\n\n`;
  
  // Best used for section
  if (bestUsedFor && bestUsedFor.length > 0) {
    caption += `🎨 Perfect for:\n`;
    bestUsedFor.forEach(use => {
      caption += `• ${use}\n`;
    });
    caption += `\n`;
  }
  
  // Standard ColorChase description
  caption += `ColorChase is a daily color-matching puzzle that challenges your eye for design. Every day brings a new palette to recreate!\n\n`;
  caption += `🔥 Test your color skills today at colorchase.app\n\n`;
  caption += `#ColorChase #ColorPalette #DailyChallenge #DesignGame #ColorTheory #${formattedDate.split(' ')[0]}`;
  
  return caption;
}

async function generatePaletteImagePNG(
  colors: string[],
  scheme: string,
  dateStr: string,
  won?: boolean,
  metadata?: {
    palette_name?: string;
    palette_description?: string;
    best_used_for?: string[];
  }
): Promise<ArrayBuffer> {
  // Instagram Story size: 1080x1920
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');

  // Background - dark gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, '#1a1a1a');
  bgGradient.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Color blocks stacked vertically with hex codes on each
  const colorBlockHeight = 280;
  colors.forEach((color, i) => {
    const blockY = i * colorBlockHeight;
    
    // Draw color block
    ctx.fillStyle = color;
    ctx.fillRect(0, blockY, canvas.width, colorBlockHeight);
    
    // Draw hex code on the color block (bottom-left aligned)
    ctx.textAlign = 'left';
    ctx.font = 'bold 42px "Courier New", monospace';
    
    // Add semi-transparent background behind text for readability
    const textPadding = 15;
    const textMetrics = ctx.measureText(color);
    const textWidth = textMetrics.width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(
      20 - textPadding, 
      blockY + colorBlockHeight - 60 - textPadding, 
      textWidth + (textPadding * 2), 
      50 + (textPadding * 2)
    );
    
    // Draw the hex code text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(color, 20, blockY + colorBlockHeight - 25);
  });

  // Status badge in top-right corner if available
  if (won !== undefined) {
    const badge = won ? '✅ Won' : '❌ Lost';
    ctx.textAlign = 'right';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
    // Background for badge
    const badgeText = badge;
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeWidth = badgeMetrics.width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(
      canvas.width - badgeWidth - 50,
      20,
      badgeWidth + 40,
      70
    );
    
    // Badge text
    ctx.fillStyle = won ? '#4ade80' : '#f87171';
    ctx.fillText(badgeText, canvas.width - 30, 70);
  }

  // Add subtle shadow below color blocks
  const colorsEndY = 5 * colorBlockHeight;
  const shadowGradient = ctx.createLinearGradient(0, colorsEndY, 0, colorsEndY + 80);
  shadowGradient.addColorStop(0, 'rgba(0,0,0,0.5)');
  shadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(0, colorsEndY, canvas.width, 80);

  // Text section - now with more room
  ctx.textAlign = 'center';
  let currentY = colorsEndY + 150;

  // Date
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const [year, month, day] = dateStr.split('-');
  const dateText = `${month}/${day}/${year}`;
  ctx.fillText(dateText, canvas.width / 2, currentY);
  currentY += 100;

  // Scheme name
  if (scheme) {
    ctx.font = '48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#a0a0a0';
    const schemeText = scheme.charAt(0).toUpperCase() + scheme.slice(1) + ' Palette';
    ctx.fillText(schemeText, canvas.width / 2, currentY);
    currentY += 100;
  }

  // Branding at bottom (fixed position)
  ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Color Chase', canvas.width / 2, canvas.height - 160);

  // URL
  ctx.font = '40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#888888';
  ctx.fillText('colorchasegame.com', canvas.width / 2, canvas.height - 90);

  // Convert canvas to PNG buffer
  return canvas.toBuffer('image/png');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
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
  
  return base64;
}