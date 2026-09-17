import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Create a profile if the user doesn't have one yet
  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? "",
        username:
          user.user_metadata?.username ??
          user.email?.split("@")[0] ??
          `user_${user.id.slice(0, 8)}`,
      })
      .select("*")
      .single();
    console.error("Failed to create profile:", createError);

    if (createError || !newProfile) {
      console.error("Failed to create profile:", createError);
      return (
        <main className="min-h-screen">
          <div className="container-page py-8">
            <div className="card p-6">
              <h1 className="text-xl font-bold">Unable to load profile</h1>
              <p className="mt-2 text-sm text-slate-600">
                We couldn't create your profile. Please try again.
              </p>
            </div>
          </div>
        </main>
      );
    }

    profile = newProfile;
  }

  return (
    <main className="min-h-screen">
      <div className="container-page py-8">
        <ProfileForm initial={profile} />
      </div>
    </main>
  );
}
