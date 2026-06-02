export default {
  async fetch(request, env, ctx) {
    // 1. Loloskan keamanan browser (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    const url = new URL(request.url);
    let pathname = url.pathname;

    // JURUS ANTI-404: Paksa semua request masuk ke pintu v1beta resmi Google
    if (pathname.includes("/v1/") || pathname.includes("/v1main/")) {
      pathname = pathname.replace("/v1/", "/v1beta/").replace("/v1main/", "/v1beta/");
    } else if (pathname.includes("/chat/completions")) {
      pathname = "/v1beta/openai/chat/completions";
    } else if (!pathname.startsWith("/v1beta")) {
      // Jika Janitor langsung mengirim tanpa versi, sisipkan v1beta di depan
      pathname = "/v1beta" + pathname;
    }

    const targetUrl = "https://generativelanguage.googleapis.com" + pathname + url.search;

    let requestInit = {
      method: request.method,
      headers: new Headers(request.headers),
    };

    // 2. Filter parameter yang dibenci Google
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
      } catch (e) {
        requestInit.body = bodyText; 
      }
    }

    // 3. Tembakkan ke Google
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
