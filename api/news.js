export default async function handler(req, res) {
    // Enable CORS for development and production
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*') 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // Get the query from the URL (e.g., /api/news?q=India)
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ status: "error", message: "Missing query parameter 'q'." });
    }

    try {
        // Use the API key from Vercel Environment Variables
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error("API_KEY environment variable is missing.");
            return res.status(500).json({ status: "error", message: "Server Configuration Error: API_KEY missing." });
        }

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&apiKey=${apiKey}`;

        // Fetch data from NewsAPI Server-Side
        const newsRes = await fetch(url);
        const data = await newsRes.json();

        // Return the data directly to the Frontend
        res.status(200).json(data);
    } catch (error) {
        console.error("Backend Fetch Error:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch top headlines." });
    }
}
