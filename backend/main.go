package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/joho/godotenv"
)

// SubmitRequest represents the incoming request body
type SubmitRequest struct {
	Username string `json:"username"`
	Token string `json:"token"`
}

// SubmitResponse represents the response body
type SubmitResponse struct {
	Message string `json:"message"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

type TurnstileResponse struct{
	Success bool `json:"success"`
	ChallengeTS string `json:"challenge_ts"`
	Hostname string `json:"hostname"`
	ErrorCodes []string `json:"error-codes"`
}

func main() {

	err:=godotenv.Load()
	if err!=nil{
		log.Println("No .env file found, falling back to system environment")
	}

	
	http.HandleFunc("/api/submit", handleSubmit)

	fmt.Println("Go backend server starting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleSubmit(w http.ResponseWriter, r *http.Request) {
	// Enable CORS for frontend requests
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only accept POST requests
if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	// Parse request body
	var req SubmitRequest
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid JSON format"})
		return
	}


	// Validate username
	if req.Username == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Username is required"})
		return
	}

	ok,err:=verifyTurnstile(req.Token)
	if err!=nil{
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to verify Turnstile"})
		return
	}

	if !ok{
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Turnstile Verification Failed"})
		return
	}

	// Create success response
	response := SubmitResponse{
		Message: fmt.Sprintf("Hello %s, your form was submitted successfully!", req.Username),
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func verifyTurnstile(token string)(bool,error){
	secret:=os.Getenv("TURNSTILE_SECRET_KEY")
	if secret==""{
		return false,fmt.Errorf("TURNSTILE_SECRET_KEY not set in env")
	}

	resp ,err:=http.PostForm("https://challenges.cloudflare.com/turnstile/v0/siteverify",url.Values{"secret":{secret},"response":{token}})
	if err!=nil{
		return false,err
	}
	defer resp.Body.Close()

	body,_:=io.ReadAll(resp.Body)
	log.Println("Turnstile raw response:",string(body))

	var tsResp TurnstileResponse
	if err:=json.Unmarshal(body,&tsResp);err!=nil{
		return false,err
	}
	return tsResp.Success,nil
}
