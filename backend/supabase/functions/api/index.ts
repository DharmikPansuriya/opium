import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://opium-manager.vercel.app',  // Your Vercel domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

// Define public endpoints that don't need authentication
const publicEndpoints = [
  "/auth/login",  // Login is public, no need for Authorization header
  "/auth/register", // Register is public
  "/docs",  // Public documentation
  "/openapi.json", // Public OpenAPI spec
];

// The main function that serves requests
serve(async (req) => {
  // Handle CORS preflight requests (OPTIONS requests)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isPublicEndpoint = publicEndpoints.some((endpoint) => url.pathname.endsWith(endpoint));

    // Skip authentication for public endpoints
    if (isPublicEndpoint) {
      const backendUrl = Deno.env.get("BACKEND_URL");
      if (!backendUrl) {
        throw new Error("BACKEND_URL environment variable is not set");
      }

      const response = await fetch(backendUrl + url.pathname, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: req.body,
      });

      const data = await response.json();
      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        }
      );
    }

    // For protected endpoints, require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 401, message: "Missing authorization header" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Create a Supabase client for protected routes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get backend URL from environment variable for protected routes
    const backendUrl = Deno.env.get("BACKEND_URL");
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }

    // Forward the request to your backend (e.g., Python FastAPI application)
    const response = await fetch(backendUrl + req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    // Get the response data
    const data = await response.json();

    // Return the response with CORS headers
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
