"use server"

import { cookies } from "next/headers"

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8069"
const ODOO_DB = process.env.ODOO_DB 

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (ODOO_DB) {
    headers["X-Odoo-Database"] = ODOO_DB
  }
  return headers
}

export async function signupAction(payload: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contractor/signup`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        })

        const text = await response.text()
        let data
        try {
            data = JSON.parse(text)
        } catch (e) {
            data = null
        }

        if (!response.ok) {
            return { success: false, error: data?.message || text || "Signup failed", status: response.status }
        }

        if (data?.token) {
            const cookieStore = await cookies()
            cookieStore.set("auth_token", data.token, {
                httpOnly: false, // Changed to false to allow client-side AuthGuard to verify
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24, // 1 day
                path: "/",
            })
        }

        return { success: true, data, status: response.status }
    } catch (error: any) {
        console.error("Signup Action Error:", error)
        return { success: false, error: error.message || "Failed to connect to backend" }
    }
}

export async function loginAction(payload: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contractor/login`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        })

        const text = await response.text()
        let data
        try {
            data = JSON.parse(text)
        } catch (e) {
            data = null
        }

        if (!response.ok) {
            return { success: false, error: data?.message || text || "Login failed", status: response.status }
        }

        if (data?.token) {
           const cookieStore = await cookies()
            cookieStore.set("auth_token", data.token, {
                httpOnly: false, // Changed to false to allow client-side AuthGuard to verify
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24, // 1 day
                path: "/",
            })
        }

        return { success: true, data, status: response.status }
    } catch (error: any) {
        console.error("Login Action Error:", error)
        return { success: false, error: error.message || "Failed to connect to backend" }
    }
}

export async function signoutAction() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        const headers = getHeaders()
        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        // Call backend signout API
        await fetch(`${API_BASE_URL}/api/contractor/signout`, {
            method: "POST",
            headers,
        })

        // Always clear cookie regardless of backend response
        cookieStore.delete("auth_token")
        
        return { success: true }
    } catch (error) {
        console.error("Signout Action Error:", error)
        // Ensure cookie is deleted even if API call fails
        const cookieStore = await cookies()
        cookieStore.delete("auth_token")
        return { success: true }
    }
}

export async function getContractorProfileAction() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return { success: false, error: "Not authenticated" }
        }

        const headers = getHeaders()
        headers["Authorization"] = `Bearer ${token}`

        const response = await fetch(`${API_BASE_URL}/api/contractor/profile`, {
            method: "GET",
            headers,
            cache: "no-store",
        })

        const text = await response.text()
        let data
        try {
            data = JSON.parse(text)
        } catch (e) {
            data = null
        }

        if (!response.ok) {
            return { success: false, error: data?.message || text || "Failed to fetch profile", status: response.status }
        }

        return { success: true, data: data.contractor }
    } catch (error: any) {
        console.error("Get Profile Action Error:", error)
        return { success: false, error: error.message || "Failed to connect to backend" }
    }
}
