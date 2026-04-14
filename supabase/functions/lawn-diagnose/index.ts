import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TreatmentItem {
  name: string;
  route: string;
  urgency: 'high' | 'medium' | 'low';
}

interface DiagnosisResult {
  diagnosis: string;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  treatments: TreatmentItem[];
  recommended_plan: 'GrassBasic' | 'GrassPro' | 'GrassNatural' | null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symptoms_text, image_base64, image_media_type, session_id } = await req.json();

    if (!symptoms_text && !image_base64) {
      return new Response(
        JSON.stringify({ error: 'symptoms_text or image_base64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const client = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY')! });

    // Build message content — image (optional) + text
    const content: Anthropic.MessageParam['content'] = [];

    if (image_base64 && image_media_type) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType = validTypes.includes(image_media_type) ? image_media_type : 'image/jpeg';
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: image_base64,
        },
      });
    }

    content.push({
      type: 'text',
      text: symptoms_text || 'Please analyze this lawn photo.',
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an expert turfgrass pathologist. Analyse the user's lawn symptom description (and photo if provided) and return ONLY valid JSON — no markdown fences, no explanation outside the JSON.

Return this exact shape:
{
  "diagnosis": "short diagnosis label (e.g. Brown Patch, Grub Damage, Drought Stress, Nitrogen Deficiency)",
  "confidence": "high|medium|low",
  "explanation": "2–3 sentence plain-English explanation of what you see and why",
  "treatments": [
    { "name": "Service name", "route": "/lawn-care", "urgency": "high|medium|low" }
  ],
  "recommended_plan": "GrassBasic|GrassPro|GrassNatural|null"
}

Plan selection — choose the MOST appropriate based on severity and user intent:
- "GrassBasic": lawn is in good or healthy condition and only preventive/maintenance care is needed; OR a single mild issue (light weeds, slight discoloration, thin patches in one area); primary need is seasonal fertilization, pre-emergent, or basic weed control; NO active disease, infestation, or structural damage.
- "GrassPro": diagnosable active condition requiring targeted treatment — fungal or bacterial disease, insect infestation, grub damage, significant bare/dead areas needing aeration + overseeding, or multiple simultaneous issues that will worsen without prompt intervention.
- "GrassNatural": user explicitly mentions organic, eco-friendly, chemical-free preference, or safety concern about kids/pets — prioritise this whenever the user signals an organic preference, regardless of severity.
- null: symptoms are too vague to determine a plan (no description and no usable photo), image quality is too poor to assess, or the condition is outside standard lawn care scope.

Key rule: a lawn described as healthy, good, or low-maintenance should return "GrassBasic" — not null and not GrassPro.

Confidence rules:
- "low": symptoms are vague or ambiguous, image quality is poor, or condition is outside common lawn pathology — do not guess
- "medium": likely diagnosis but would benefit from in-person assessment to confirm
- "high": clear, confident diagnosis from the symptoms and/or photo

Valid route values for treatments: "/lawn-care", "/CleanLawn/aeration-seeding", "/CleanLawn/mowing", "/CleanLawn/mulching", "/CleanLawn/leaf-removal", "/quote"

Do not fabricate specifics. Return only the JSON object, nothing else.`,
      messages: [{ role: 'user', content }],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON object from response (handles any accidental wrapping)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned an unexpected format — no JSON found');
    }

    const result: DiagnosisResult = JSON.parse(jsonMatch[0]);

    // Persist to lawn_diagnoses (best-effort — don't fail the request if this errors)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      await supabase.from('lawn_diagnoses').insert([{
        session_id: session_id ?? null,
        symptoms_text: symptoms_text ?? null,
        diagnosis: result.diagnosis,
        confidence: result.confidence,
        explanation: result.explanation,
        treatments: result.treatments,
        routed_to_quote: result.confidence === 'low',
      }]);
    } catch {
      // non-fatal — diagnosis still returned to user
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
