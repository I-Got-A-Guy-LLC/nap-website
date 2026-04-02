import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendCategorySuggestionApproved } from "@/lib/emails";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, parent_id, is_active")
      .order("name", { ascending: true });

    const { data: suggestions } = await supabase
      .from("category_suggestions")
      .select("id, suggested_name, member_name, member_email, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return NextResponse.json({
      categories: categories || [],
      suggestions: suggestions || [],
    });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, parent_id, suggestion_id } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Create the category
    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        parent_id: parent_id || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Category create error:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }

    // If this was from a suggestion, mark it as approved and notify member
    if (suggestion_id) {
      const { data: suggestion } = await supabase
        .from("category_suggestions")
        .update({ status: "approved" })
        .eq("id", suggestion_id)
        .select("member_email, member_name")
        .single();

      if (suggestion) {
        await sendCategorySuggestionApproved(
          suggestion.member_email,
          suggestion.member_name,
          name.trim()
        );
      }
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Handle suggestion rejection
    if (body.suggestion_id && body.action === "reject") {
      await supabase
        .from("category_suggestions")
        .update({ status: "rejected" })
        .eq("id", body.suggestion_id);

      return NextResponse.json({ success: true });
    }

    // Handle category update (enable/disable, rename)
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Category id is required" },
        { status: 400 }
      );
    }

    const allowedFields = ["name", "is_active"];
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in fields) {
        updateData[key] = fields[key];
      }
    }

    const { data: category, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Category update error:", error);
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Categories PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
