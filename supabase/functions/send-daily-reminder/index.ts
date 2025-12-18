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
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users who want email notifications
    // You'll need to add an 'email_notifications' column to profiles table
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('email, username, email_notifications')
      .eq('email_notifications', true);

    if (usersError) {
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No users to notify', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate time until reset (9 AM Pacific = 5 PM UTC)
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCHours(17, 0, 0, 0); // 5 PM UTC = 9 AM PST
    if (now.getUTCHours() >= 17) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    const hoursUntilReset = Math.round((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60));

    // Send emails via Resend
    const emailPromises = users.map(async (user) => {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Time to Play ColorChase!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 16px 0; text-align: center;">
                🎨 ColorChase Reminder
              </h1>
              <p style="color: #cbd5e1; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Hey ${user.username || 'Color Chaser'}! 👋
              </p>
              <div style="background-color: #475569; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #f1f5f9; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                  ⏰ <strong>Only ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''} left</strong> to complete today's palette!
                </p>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
                  The daily palette resets at 9 AM Pacific. Don't miss your chance to keep your streak alive!
                </p>
              </div>
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://colorchasegame.com" 
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.4);">
                  Play Now
                </a>
              </div>
              <div style="border-top: 1px solid #475569; margin-top: 32px; padding-top: 24px;">
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;">
                  Don't want these reminders?
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                  <a href="https://colorchasegame.com/auth/profile" style="color: #a78bfa; text-decoration: none;">Manage your notification preferences</a>
                </p>
              </div>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">
              © ${new Date().getFullYear()} ColorChase. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'ColorChase <noreply@colorchasegame.com>',
          to: [user.email],
          subject: `⏰ ${hoursUntilReset}h left to play today's ColorChase!`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send email to ${user.email}:`, error);
        throw new Error(`Resend API error: ${error}`);
      }

      return response.json();
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Sent ${successful} emails, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        total: users.length
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
