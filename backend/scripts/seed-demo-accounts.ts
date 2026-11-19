import dotenv from "dotenv";
dotenv.config();

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV === "production") {
  throw new Error("Demo accounts cannot be created in production.");
}

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const roleAccounts = [
  { role: "DRIVER", email: "driver@demo.kuya-meron-pa.local", firstName: "Demo", lastName: "Driver" },
  { role: "PARKING_ATTENDANT", email: "attendant@demo.kuya-meron-pa.local", firstName: "Demo", lastName: "Attendant" },
  { role: "PARKING_ADMINISTRATOR", email: "parking-admin@demo.kuya-meron-pa.local", firstName: "Demo", lastName: "Parking Admin" },
  { role: "SYSTEM_ADMINISTRATOR", email: "system-admin@demo.kuya-meron-pa.local", firstName: "Demo", lastName: "System Admin" },
];

function generatePassword() {
  return `${crypto.randomBytes(9).toString("base64url")}!A7`;
}

async function ensureAccount(account: typeof roleAccounts[number]) {
  const password = generatePassword();
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: account.firstName,
      last_name: account.lastName,
    },
  });

  let userId = data.user?.id;

  if (error) {
    if (!error.message.toLowerCase().includes("already been registered")) throw error;
    const { data: existingPage } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = existingPage.users.find((user) => user.email?.toLowerCase() === account.email)?.id;
    if (userId) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: {
          first_name: account.firstName,
          last_name: account.lastName,
        },
      });
      if (updateError) throw updateError;
    }
  }

  if (!userId) throw new Error(`Could not resolve demo account ${account.email}`);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: account.role,
      first_name: account.firstName,
      last_name: account.lastName,
      status: "ACTIVE",
    })
    .eq("id", userId);

  if (profileError) throw profileError;

  await supabase.from("audit_logs").insert({
    action: "DEMO_ACCOUNT_PROVISIONED",
    entity_type: "profiles",
    entity_id: userId,
    metadata: { role: account.role, email: account.email },
  });

  return { ...account, password, userId };
}

async function main() {
  const credentials = [];
  for (const account of roleAccounts) {
    credentials.push(await ensureAccount(account));
  }

  const credentialPath = path.resolve(process.cwd(), "..", "database", "seeds", ".demo-credentials.json");
  fs.writeFileSync(credentialPath, JSON.stringify(credentials, null, 2), { mode: 0o600 });

  console.log("Development demo accounts created/updated.");
  console.log(`Credentials saved to ${credentialPath}`);
  console.log("The file is excluded by .gitignore. Delete it after testing.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
