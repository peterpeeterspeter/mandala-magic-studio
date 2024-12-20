import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { settings, predictionId } = await req.json()
    console.log("Received request:", { settings, predictionId })
    
    if (predictionId) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
          "Content-Type": "application/json",
        },
      })

      const prediction = await response.json()
      console.log("Prediction status:", prediction.status)

      return new Response(
        JSON.stringify(prediction),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        input: {
          prompt: `Create a line art coloring page in black and white of: ${settings.prompt}. Make it suitable for coloring with clear, well-defined lines. Style: line art, black and white`,
          negative_prompt: "blurry, bad, text, watermark, signature, color, photorealistic, shadows, gradient",
          num_outputs: 1,
          width: 768,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    })

    const prediction = await response.json()
    console.log("Prediction created:", prediction)

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})