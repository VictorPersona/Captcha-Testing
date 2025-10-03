"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getCaptchaToken } from "./captcha";

export default function Home() {
  const [username, setUsername] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const backendAPIURL = process.env.NEXT_PUBLIC_RECAPTCHA_BACKEND;
  console.log("Connecting to the backend url : ", backendAPIURL);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResponseMessage("");

    const token = await getCaptchaToken();
    console.log(token);

    try {
      const response = await fetch(`${backendAPIURL}/api/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, token: token }),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage(data.message);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      setError(
        "Failed to connect to backend. Make sure the Go server is running on port 8080."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Submit Form</CardTitle>
          <CardDescription>
            Enter your username to submit the form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Placeholder for CAPTCHA widget - to be integrated later */}
            {/* <div
            id="captcha-container"
            className="min-h-[78px] border-2 border-dashed border-muted rounded-md flex items-center justify-center text-muted-foreground text-sm"
          >
            CAPTCHA will be integrated here
          </div> */}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </form>

          {/* Response message display */}
          {responseMessage && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-800 dark:text-green-200 text-sm">
                {responseMessage}
              </p>
            </div>
          )}

          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
