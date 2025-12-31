const GOOGLE_APPS_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || "";

if (!GOOGLE_APPS_SCRIPT_URL) {
  console.warn(
    "Warning: VITE_GOOGLE_APPS_SCRIPT_URL environment variable is not set. API calls may fail."
  );
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  token?: string;
  error?: string;
  csv?: string;
}

// export async function callGoogleAppsScript(
//   action: string,
//   payload: Record<string, unknown>
// ): Promise<ApiResponse> {
//   try {
//     const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         action,
//         ...payload,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result: ApiResponse = await response.json();
//     return result;
//   } catch (error) {
//     console.error("API call error:", error);
//     return {
//       success: false,
//       error: "Failed to connect to the server",
// };
// }
// }

export async function callGoogleAppsScript(
  action: string,
  payload: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    // Convert payload into query params
    const params = new URLSearchParams({
      action,
      data: JSON.stringify(payload),
    });

    const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result;
  } catch (error) {
    console.error("API call error:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}
