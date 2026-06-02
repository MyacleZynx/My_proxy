export default {
  async fetch(request, env, ctx) {
    // Ganti 'AIzaSyxxxxxxxxx' di bawah dengan API Key Google lu yang asli!
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

    // Paksa lewat v1beta
    const targetUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=" + GOOGLE_API_KEY;

    let requestInit = {
      method: request.method,
      headers: new Headers(request.headers),
    };
    
    // Hapus header Authorization dari JanitorAI biar Google gak bingung
    requestInit.headers.delete("Authorization");

    if (request.method !== "GET" && request.method !== "HEAD") {
      let bodyText = await request.text();
      try {
        let bodyJson = JSON.parse(bodyText);
        delete bodyJson.frequency_penalty;
        delete bodyJson.repetition_penalty;
        delete bodyJson.presence_penalty;
        delete bodyJson.top_k;
        requestInit.body = JSON.stringify(bodyJson);
        requestInit.headers.delete("content-length");
      } catch (e) { requestInit.body = bodyText; }
    }

    const response = await fetch(targetUrl, requestInit);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  }
};
