## 2025-05-14 - SSRF in Image Proxy
**Vulnerability:** The `/api/photos/proxy` endpoint was vulnerable to Server-Side Request Forgery (SSRF). It accepted a `url` parameter and fetched its content without any validation, allowing attackers to proxy requests to internal or external unauthorized domains.
**Learning:** Proxy endpoints, even when intended for simple tasks like bypassing CORS for images, are dangerous if not properly restricted. The lack of authentication and domain whitelisting made this a high-severity risk.
**Prevention:**
1. Require authentication for all proxy endpoints.
2. Implement strict domain whitelisting for the target URLs.
3. Validate the response's content type (e.g., ensure it's actually an image).
4. Implement timeouts to prevent hanging connections and resource exhaustion.
