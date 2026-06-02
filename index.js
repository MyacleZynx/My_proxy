export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    // Kunci pintu utamanya ke v1beta OpenAI milik Google
    const targetUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    let requestInit = {
      method: request.method,
      headers: new Headers(request.headers),
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      let bodyText = await request.text();
      try {
        let bodyJson = JSON.parse(bodyText);
        
        // PINTAR: Proxy tetep make nama model yang lu ketik di JanitorAI!
        // Gak dikunci mati di kode, jadi lu bebas ganti-ganti di aplikasi.
        if (bodyJson.model) {
          bodyJson.model = bodyJson.model; 
        }

        // Hapus parameter pembawa eror 400
        delete bodyJson.frequency_penalty;
        delete bodyJson.repetition_penalty;
        delete bodyJson.presence_penalty;
        delete bodyJson.top_k;
        
        requestInit.body = JSON.stringify(bodyJson);
        requestInit.headers.delete("content-length");
      } catch (e) {
        requestInit.body = bodyText; 
      }
    }

    try {
      const response = await fetch(targetUrl, requestInit);
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (e) {
      return new Response("Error Proxy: " + e.message, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
