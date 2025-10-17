// run_server.js
// Node.js HTTP server implementing a simple API similar to your Deno version
// Routes:
//  - POST /foo    -> expects JSON { "name": "Alice" } -> responds { "message": "Hello Alice from foo!" }
//  - GET  /       -> simple health check

const http = require('http');
const url = require('url');

const PORT = Number(process.env.PORT ?? 8080);

function jsonResponse(body, status = 200) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Connection": "keep-alive",
  };
  return {
    status,
    headers,
    body: JSON.stringify(body)
  };
}

function textResponse(body, status = 200) {
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Connection": "keep-alive",
  };
  return {
    status,
    headers,
    body
  };
}

async function handleRequest(req, res) {
  try {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Health check
    if (req.method === "GET" && (pathname === "/" || pathname === "/health")) {
      const response = jsonResponse({ status: "ok", path: pathname });
      res.writeHead(response.status, response.headers);
      res.end(response.body);
      return;
    }

    if (req.method === "POST" && pathname === "/foo") {
      const contentType = req.headers["content-type"] ?? "";
      if (!contentType.includes("application/json")) {
        const response = jsonResponse({ error: "Content-Type must be application/json" }, 415);
        res.writeHead(response.status, response.headers);
        res.end(response.body);
        return;
      }

      // Parse JSON safely
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          const name = typeof parsedBody?.name === "string" ? parsedBody.name.trim() : "";
          
          if (!name) {
            const response = jsonResponse({ error: "Missing or empty 'name' field" }, 400);
            res.writeHead(response.status, response.headers);
            res.end(response.body);
            return;
          }

          const message = `Hello ${name} from foo!`;
          const response = jsonResponse({ message }, 200);
          res.writeHead(response.status, response.headers);
          res.end(response.body);
        } catch (err) {
          console.error("Failed to parse JSON:", err);
          const response = jsonResponse({ error: "Invalid JSON body" }, 400);
          res.writeHead(response.status, response.headers);
          res.end(response.body);
        }
      });
      return;
    }

    // Not found
    const response = jsonResponse({ error: "Not found" }, 404);
    res.writeHead(response.status, response.headers);
    res.end(response.body);
  } catch (err) {
    console.error("Unhandled error:", err);
    const response = jsonResponse({ error: "Internal server error" }, 500);
    res.writeHead(response.status, response.headers);
    res.end(response.body);
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Starting server on :${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`API endpoint: POST http://localhost:${PORT}/foo`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
