import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAI } from "@/lib/ai";

export const runtime = "nodejs";

function clean(value: unknown, max = 2000) {
  return String(value ?? "").slice(0, max);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = clean(body.action, 80);
    const supabase = await createClient();

    if (action === "profile_assistant") {
      const username = clean(body.username, 80).toLowerCase();
      const question = clean(body.question, 1000);
      if (!username || !question) return NextResponse.json({ error: "Username and question are required." }, { status: 400 });

      const { data: profile } = await supabase.from("profiles").select("full_name,title,company,bio,website,linkedin,instagram,facebook,x_url,tiktok,github").eq("username", username).single();
      if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

      const answer = await generateAI(`You are Linkora AI, a professional profile assistant. Answer only from the public profile data below. Never invent facts, private information, contact details, achievements, prices, or services that are not present. If the answer is not available, say so clearly. Keep the response concise and useful.\n\nPUBLIC PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nVISITOR QUESTION:\n${question}`);
      return NextResponse.json({ answer });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    if (action === "profile_builder") {
      const details = clean(body.details, 3000);
      const tone = clean(body.tone, 80) || "professional";
      if (!details) return NextResponse.json({ error: "Tell the AI a little about yourself first." }, { status: 400 });
      const answer = await generateAI(`You are Linkora AI Profile Builder. Create polished professional profile content from the user's notes. Do not invent credentials or experience. Tone: ${tone}. Return exactly these sections:\nHEADLINE:\nBIO:\nCALL_TO_ACTION:\n\nUSER NOTES:\n${details}`);
      return NextResponse.json({ answer });
    }

    if (action === "marketing") {
      const prompt = clean(body.prompt, 3000);
      const platform = clean(body.platform, 80) || "Instagram";
      if (!prompt) return NextResponse.json({ error: "Describe the campaign or business first." }, { status: 400 });
      const answer = await generateAI(`You are Linkora AI Marketing Assistant. Create practical marketing copy based only on the information provided. Do not fabricate claims, discounts, numbers, testimonials, or product features. Platform: ${platform}. Return a strong caption, CTA, and 5 relevant hashtags.\n\nBRIEF:\n${prompt}`);
      return NextResponse.json({ answer });
    }

    if (action === "menu_assistant") {
      const slug = clean(body.slug, 120).toLowerCase();
      const question = clean(body.question, 1000);
      if (!slug || !question) return NextResponse.json({ error: "Menu and question are required." }, { status: 400 });
      const { data: menu } = await supabase.from("menus").select("id,name,description,organization_id,organizations(name)").eq("slug", slug).eq("active", true).single();
      if (!menu) return NextResponse.json({ error: "Menu not found." }, { status: 404 });
      const { data: sections } = await supabase.from("menu_sections").select("id,name").eq("menu_id", menu.id).order("sort_order");
      const ids = (sections || []).map((x:any) => x.id);
      const { data: items } = ids.length ? await supabase.from("menu_items").select("name,description,price,available,section_id").in("section_id", ids).eq("available", true).order("sort_order") : { data: [] };
      const answer = await generateAI(`You are Linkora AI for a restaurant/hotel digital menu. Answer only from the supplied menu. Do not invent ingredients, allergens, dietary properties, availability, discounts or prices. If the menu does not contain the answer, say so. Keep the recommendation concise.\n\nMENU:\n${JSON.stringify({menu,sections,items})}\n\nCUSTOMER QUESTION:\n${question}`);
      await supabase.from("engagement_events").insert({ event_type: "menu_ai_question", organization_id: menu.organization_id, metadata: { menu_id: menu.id } });
      return NextResponse.json({ answer });
    }

    if (action === "analytics") {
      const { data: profile } = await supabase.from("profiles").select("full_name,title,company,bio").eq("id", user.id).single();
      const { data: events } = await supabase.from("engagement_events").select("event_type,target,created_at").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(500);
      const answer = await generateAI(`You are Linkora AI Analytics. Analyze the supplied engagement events and give concise, actionable insights. Do not claim causation when the data only shows correlation. Mention limitations if the dataset is small. Return: SUMMARY, TOP SIGNALS, RECOMMENDATIONS.\n\nPROFILE:\n${JSON.stringify(profile)}\n\nEVENTS:\n${JSON.stringify(events ?? [])}`);
      return NextResponse.json({ answer });
    }

    if (action === "org_assistant") {
      const organizationId = clean(body.organizationId, 80);
      const question = clean(body.question, 1200);
      if (!organizationId || !question) return NextResponse.json({ error: "Organization and question are required." }, { status: 400 });
      const { data: membership } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("profile_id", user.id).maybeSingle();
      if (!membership) return NextResponse.json({ error: "You do not have access to this organization." }, { status: 403 });
      const { data: org } = await supabase.from("organizations").select("name,type,description").eq("id", organizationId).single();
      const { data: people } = await supabase.from("people").select("full_name,title,status,metadata").eq("organization_id", organizationId).limit(1000);
      const { data: attendance } = await supabase.from("attendance_records").select("type,scanned_at,person_id").eq("organization_id", organizationId).order("scanned_at", { ascending: false }).limit(1000);
      const answer = await generateAI(`You are Linkora AI Organization Assistant. Answer only from the organization data supplied. Protect privacy: do not expose sensitive or unnecessary personal information. Prefer aggregate insights. If the data does not answer the question, say so.\n\nORGANIZATION:\n${JSON.stringify(org)}\n\nPEOPLE:\n${JSON.stringify(people ?? [])}\n\nATTENDANCE:\n${JSON.stringify(attendance ?? [])}\n\nQUESTION:\n${question}`);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: "Unknown AI action." }, { status: 400 });
  } catch (error: any) {
    console.error("Linkora AI error", error);
    return NextResponse.json({ error: error?.message || "AI request failed." }, { status: 500 });
  }
}
