import { currentUser } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import DesignMachine from "@/components/machine/DesignMachine";

export default async function MachinePage() {
  const user = await currentUser();
  const userId = user?.id;

  let brandName = user?.firstName
    ? `${user.firstName.toUpperCase()} · POWERED BY OPB CREW`
    : "COACH TEO · POWERED BY OPB CREW";

  let brandColors: [string, string, string] | null = null;

  if (userId) {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("user_profiles")
        .select("brand_bg, brand_accent, brand_text, name")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.brand_bg && data?.brand_accent && data?.brand_text) {
        brandColors = [data.brand_bg, data.brand_accent, data.brand_text];
      }

      if (data?.name) {
        brandName = `${data.name.toUpperCase()} · POWERED BY OPB CREW`;
      }
    } catch (error) {
      console.error("Error loading brand data:", error);
    }
  }

  return (
    <DesignMachine
      brandName={brandName}
      brandColors={brandColors}
    />
  );
}
