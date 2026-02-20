package api

import (
	"net/http"
	"strings"
)

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		allowed := map[string]bool{
			"http://localhost:3000":                true,
			"https://mcmaster-softball.vercel.app": true,
		}

		// Allow Vercel preview deployments too: https://<anything>.vercel.app
		if strings.HasSuffix(origin, ".vercel.app") {
			allowed[origin] = true
		}

		if allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}

		// Handle preflight
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
