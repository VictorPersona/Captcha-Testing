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

// CaptchaResponse matches Google's response
type CaptchaResponse struct {
	Success     bool     `json:"success"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	Score       float64  `json:"score"`
	ErrorCodes  []string `json:"error-codes"`
}


func main() {

	    // Load .env file
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found, relying on system environment")
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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req SubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	// Validate username
	
	if req.Username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	captchaOK, err := verifyCaptcha(req.Token)
	if err != nil {
		http.Error(w, "Captcha verification failed", http.StatusInternalServerError)
		return
	}
	if !captchaOK {
		http.Error(w, "Captcha failed", http.StatusForbidden)
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



func verifyCaptcha(token string)(bool,error){
	secret:=os.Getenv("CAPTCHA_SECRET_KEY")

	if secret == ""{
		return false,fmt.Errorf("CAPTCHA_SECRET_KEY not set in env")
	}
	resp,err :=http.PostForm("https://www.google.com/recaptcha/api/siteverify", url.Values{"secret":{secret},"response":{token}})
	if err!=nil{
		return false,err
	}
	defer resp.Body.Close()

	body,_:=io.ReadAll(resp.Body)
	log.Println("Raw body:", string(body))


	var captchaRes CaptchaResponse
	if err:=json.Unmarshal(body,&captchaRes);err!=nil{
		return false,err
	}
	return captchaRes.Success && captchaRes.Score >=0.5,nil
}

