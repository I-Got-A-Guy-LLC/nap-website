/**
 * NAP Directory — Seed Categories
 * Usage: source .env.local && npx tsx scripts/seed-categories.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const categories: Record<string, string[]> = {
  "AI & Technology": [
    "AI Consulting & Strategy", "AI Tools & Automation", "AI Content Creation",
    "AI Training & Education", "Software Development", "IT Support & Managed Services",
    "Cybersecurity", "Data & Analytics", "App Development",
  ],
  "Financial Services": [
    "Banks & Credit Unions", "Mortgage Brokers", "Financial Advisors",
    "Accountants & CPAs", "Bookkeepers", "Tax Preparation",
    "Insurance — Life & Health", "Insurance — Property & Casualty", "Payroll Services",
  ],
  "Real Estate": [
    "Realtors & Agents", "Property Management", "Title Companies",
    "Surveyors", "Home Inspectors", "Appraisers",
    "Commercial Real Estate", "Real Estate Attorneys",
  ],
  "Legal Services": [
    "Business Law", "Family Law", "Estate Planning", "Real Estate Law",
    "Employment Law", "Personal Injury", "Criminal Defense", "Notary Services",
  ],
  "Health & Wellness": [
    "Physicians & Clinics", "Dentists", "Chiropractors", "Physical Therapy",
    "Mental Health & Counseling", "Massage Therapy", "Nutrition & Dietetics",
    "Fitness & Personal Training", "Med Spas",
  ],
  "Home & Construction": [
    "General Contractors", "Plumbers", "Electricians", "HVAC", "Landscaping",
    "Cleaning Services", "Interior Design", "Flooring", "Roofing", "Painting",
    "Security Systems",
  ],
  "Marketing & Media": [
    "Digital Marketing", "Social Media Management", "Graphic Design",
    "Photography", "Videography", "Web Design & Development",
    "Copywriting", "PR & Communications", "Print & Signage",
  ],
  "Business Services": [
    "Staffing & Recruiting", "HR Consulting", "Business Coaching",
    "Virtual Assistants", "Printing & Office Supplies",
    "Shipping & Logistics", "Commercial Cleaning",
  ],
  "Food & Hospitality": [
    "Restaurants & Cafes", "Catering", "Food Trucks", "Bakeries",
    "Coffee Shops", "Event Venues", "Hotels & Lodging", "Bars & Breweries",
  ],
  "Retail & Products": [
    "Clothing & Apparel", "Gifts & Specialty", "Florists",
    "Auto Sales & Service", "Furniture & Home Goods",
    "Sporting Goods", "Pet Supplies",
  ],
  "Education & Coaching": [
    "Business Coaches", "Life Coaches", "Tutoring",
    "Trade Schools & Training", "Music & Arts Instruction",
    "Child Care & Preschool", "Online Courses",
  ],
  "Event & Entertainment": [
    "Event Planning", "DJs & Musicians", "Photo Booths",
    "Balloon & Decor", "Party Rentals", "Officiants",
    "Entertainment & Activities",
  ],
  "Nonprofit & Community": [
    "Nonprofits", "Religious Organizations", "Community Groups",
    "Foundations & Charities",
  ],
  "Beauty & Personal Care": [
    "Hair Salons & Barbers", "Nail Salons", "Esthetics & Skincare",
    "Tattoo & Piercing", "Spas",
  ],
  "Automotive": [
    "Auto Repair", "Detailing", "Body Shops", "Towing", "Auto Glass", "Car Rental",
  ],
};

async function main() {
  // Check if categories already exist
  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log(`Categories table already has ${count} entries. Skipping seed.`);
    return;
  }

  let mainCount = 0;
  let subCount = 0;

  // Insert main categories
  for (const [index, mainName] of Object.keys(categories).entries()) {
    const { data: mainCat, error: mainError } = await supabase
      .from("categories")
      .insert({
        name: mainName,
        slug: slugify(mainName),
        parent_id: null,
        sort_order: index,
        is_active: true,
      })
      .select("id")
      .single();

    if (mainError) {
      console.error(`Failed to insert main category "${mainName}":`, mainError.message);
      continue;
    }

    mainCount++;
    console.log(`✓ ${mainName}`);

    // Insert subcategories
    const subs = categories[mainName];
    for (const [subIndex, subName] of subs.entries()) {
      const { error: subError } = await supabase
        .from("categories")
        .insert({
          name: subName,
          slug: slugify(subName),
          parent_id: mainCat.id,
          sort_order: subIndex,
          is_active: true,
        });

      if (subError) {
        console.error(`  Failed to insert "${subName}":`, subError.message);
        continue;
      }
      subCount++;
    }
  }

  // Insert "Other" category
  const { error: otherError } = await supabase
    .from("categories")
    .insert({
      name: "Other (suggest a category)",
      slug: "other",
      parent_id: null,
      sort_order: 999,
      is_active: true,
    });

  if (!otherError) {
    mainCount++;
    console.log("✓ Other (suggest a category)");
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`Main categories: ${mainCount}`);
  console.log(`Subcategories: ${subCount}`);
  console.log(`Total: ${mainCount + subCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
