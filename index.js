export default {
  async fetch(request, env, ctx) {
    // PENTING: Ganti teks di bawah dengan API Key Google lu yang asli (AIzaSy...)
    const GOOGLE_API_KEY = "AQ.Ab8RN6Isup9WFrqYS_DxyscHjz1mW44nmHjiVSA3YobVSK1hPA"; 
    
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    // Kita arahkan ke endpoint chat completions v1beta resmi Google
    const targetUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    // Buat objek request baru untuk membersihkan header bawaan JanitorAI
    let newHeaders = new Headers();
    newHeaders.set("Content-Type", "application/json");
    // Masukkan kunci Google asli lu ke header Authorization resmi
    newHeaders.set("Authorization", `Bearer ${GOOGLE_API_KEY}`);

    let requestInit = {
      method: request.method,
      headers: newHeaders,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      let bodyText = await request.text();
      try {
        let bodyJson = JSON.parse(bodyText);
        
        // Bersihkan parameter yang dibenci Google agar tidak eror 400
        delete bodyJson.frequency_penalty;
        delete bodyJson.repetition_penalty;
        delete bodyJson.presence_penalty;
        delete bodyJson.top_k;
        
        requestInit.body = JSON.stringify(bodyJson);
      } catch (e) {
        requestInit.body = bodyText; 
      }
    }

    try {
      const response = await fetch(targetUrl, requestInit);
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (e) {
      return new Response("Error Proxy: " + e.message, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
