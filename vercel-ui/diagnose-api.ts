const API_BASE_URL = "http://localhost:8069"
const ODOO_DB = "odoo"

async function fetchServiceQuestions(serviceId: string | number) {
    const headers = {
        "Content-Type": "application/json",
        "X-Odoo-Database": ODOO_DB
    }
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}/questions`, {
        method: "GET",
        headers,
    })
    return await response.json()
}

async function fetchAvailableServices() {
    const headers = {
        "Content-Type": "application/json",
        "X-Odoo-Database": ODOO_DB
    }
    const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: "GET",
        headers,
    })
    return await response.json()
}

async function diagnose() {
    console.log("--- Starting Diagnosis ---");
    
    console.log("Fetching services...");
    try {
        const servicesRes = await fetchAvailableServices();
        console.log("Services Response Status:", servicesRes.status);
        
        if (servicesRes.status === "success" && servicesRes.data) {
            console.log(`Found ${servicesRes.data.length} services.`);
            
            for (const service of servicesRes.data) {
                console.log(`\nChecking questions for service: ${service.name} (ID: ${service.id})...`);
                const questionsRes = await fetchServiceQuestions(service.id);
                console.log("Questions Response Status:", questionsRes.status);
                
                if (questionsRes.status === "success") {
                let qCount = 0
                if (Array.isArray(questionsRes.data)) {
                    qCount = questionsRes.data.length
                } else if (questionsRes.data && Array.isArray(questionsRes.data.questions)) {
                    qCount = questionsRes.data.questions.length
                }
                console.log(`Found ${qCount} questions.`);
                if (qCount > 0) {
                    const firstQ = Array.isArray(questionsRes.data) ? questionsRes.data[0] : questionsRes.data.questions[0];
                    console.log("First question data:", JSON.stringify(firstQ, null, 2));
                }
            } else {
                    console.log("Error message:", questionsRes.message);
                }
            }
        } else {
            console.log("Failed to fetch services. Message:", servicesRes.message);
        }
    } catch (e: any) {
        console.error("Fetch failed:", e.message);
    }
    
    console.log("\n--- Diagnosis Complete ---");
}

diagnose().catch(console.error);
