import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Health check
    if (path.endsWith("/health") || path === "/make-server-2cd756cf" || path === "/make-server-2cd756cf/") {
      return new Response(
        JSON.stringify({ status: "healthy", timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get count
    if (path.endsWith("/waitlist/count")) {
      const { data } = await supabase
        .from("kv_store_2cd756cf")
        .select("value")
        .eq("key", "waitlist:count")
        .maybeSingle();
      
      const count = data?.value ? parseInt(data.value) : 20000;
      return new Response(
        JSON.stringify({ count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get latest user
    if (path.endsWith("/waitlist/latest")) {
      const { data } = await supabase
        .from("kv_store_2cd756cf")
        .select("value")
        .eq("key", "waitlist:latest")
        .maybeSingle();

      const defaultUser = { fullName: "Sarah M", universityName: "Stanford University" };
      const userData = data?.value ? JSON.parse(data.value) : defaultUser;
      
      return new Response(
        JSON.stringify({ fullName: userData.fullName, universityName: userData.universityName }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Submit form
    if (path.endsWith("/waitlist/submit") && req.method === "POST") {
      const body = await req.json();
      const { fullName, universityName, universityEmail } = body;

      if (!fullName || !universityName || !universityEmail) {
        return new Response(
          JSON.stringify({ error: "All fields are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check existing email
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
      const userId = `user_${Date.now()}`;

      const userData = {
        fullName,
        universityName,
        universityEmail,
        referralCode,
        position: newPosition,
        timestamp: new Date().toISOString(),
      };

      // Save to database
      await supabase.from("kv_store_2cd756cf").upsert([
        { key: `waitlist:user:${userId}`, value: JSON.stringify(userData) },
        { key: `waitlist:email:${universityEmail}`, value: userId },
        { key: `waitlist:referral:${referralCode}`, value: userId },
        { key: `waitlist:latest`, value: JSON.stringify(userData) },
        { key: `waitlist:count`, value: newPosition.toString() },
      ]);

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

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});