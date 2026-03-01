import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Health check endpoint
    if (path.includes("/health") || path === "/make-server-2cd756cf" || path === "/make-server-2cd756cf/") {
      return new Response(
        JSON.stringify({ 
          status: "healthy", 
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get waitlist count
    if (path.includes("/waitlist/count")) {
      const { data, error } = await supabase
        .from("kv_store_2cd756cf")
        .select("value")
        .eq("key", "waitlist:count")
        .maybeSingle();

      if (error) {
        console.error("Database error:", error);
      }

      const count = data?.value ? parseInt(data.value) : 20000;

      return new Response(
        JSON.stringify({ count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get latest user
    if (path.includes("/waitlist/latest")) {
      const { data, error } = await supabase
        .from("kv_store_2cd756cf")
        .select("value")
        .eq("key", "waitlist:latest")
        .maybeSingle();

      if (error) {
        console.error("Database error:", error);
      }

      const defaultUser = { 
        fullName: "Sarah M", 
        universityName: "Stanford University" 
      };
      
      let userData = defaultUser;
      if (data?.value) {
        try {
          userData = JSON.parse(data.value);
        } catch (e) {
          console.error("Failed to parse latest user:", e);
        }
      }

      return new Response(
        JSON.stringify({ 
          fullName: userData.fullName, 
          universityName: userData.universityName 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Submit waitlist form
    if (path.includes("/waitlist/submit") && req.method === "POST") {
      const body = await req.json();
      const { fullName, universityName, universityEmail } = body;

      // Validate input
      if (!fullName || !universityName || !universityEmail) {
        return new Response(
          JSON.stringify({ error: "All fields are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!universityEmail.includes("@")) {
        return new Response(
          JSON.stringify({ error: "Please enter a valid email address" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("kv_store_2cd756cf")
        .select("value")
        .eq("key", `waitlist:email:${universityEmail}`)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "This email is already on the waitlist" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get current count
      const { data: countData } = await supabase
        .from("kv_store_2cd756cf")
        .select("value")
        .eq("key", "waitlist:count")
        .maybeSingle();

      const currentCount = countData?.value ? parseInt(countData.value) : 20000;
      const newPosition = currentCount + 1;
      const referralCode = generateReferralCode();
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const userData = {
        fullName,
        universityName,
        universityEmail,
        referralCode,
        position: newPosition,
        timestamp: new Date().toISOString(),
      };

      // Save all data to database
      const { error: saveError } = await supabase
        .from("kv_store_2cd756cf")
        .upsert([
          { key: `waitlist:user:${userId}`, value: JSON.stringify(userData) },
          { key: `waitlist:email:${universityEmail}`, value: userId },
          { key: `waitlist:referral:${referralCode}`, value: userId },
          { key: `waitlist:latest`, value: JSON.stringify(userData) },
          { key: `waitlist:count`, value: newPosition.toString() },
        ]);

      if (saveError) {
        console.error("Error saving to database:", saveError);
        return new Response(
          JSON.stringify({ error: "Failed to save data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`✅ New user added: ${fullName} at position ${newPosition}`);

      return new Response(
        JSON.stringify({
          success: true,
          position: newPosition,
          referralCode,
          referralLink: `https://getswypd.com?ref=${referralCode}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 404 - Route not found
    return new Response(
      JSON.stringify({ error: "Not found", path }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
