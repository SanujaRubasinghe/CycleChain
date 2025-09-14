import dbConnect from "./mongodb.js";
import Knowledge from "../models/Knowledge.js";


async function generateEmbedding(text) {
    const res = await fetch("http://localhost:11434/api/embeddings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            model: "nomic-embed-text",
            prompt: text
        })
    })

    if (!res.ok) {
        throw new Error(`Ollama error: ${res.statusText}`)
    }

    const data = await res.json()
    return data.embedding
}

async function seedKnowledge() {
    await dbConnect()

    const knowledgeDocs = [
        "All bikes must be returned within 24 hours.",
        "Late returns will incur an extra hourly charge.",
        "CycleChain offers city, mountain, and electric bikes.",
        "Customers must provide a valid ID before renting.",
    ];

    for (const text of knowledgeDocs) {
        const embedding = await generateEmbedding(text)
        const doc = new Knowledge({text, embedding})
        await doc.save()
        console.log(`Inserted: ${text}`)
    }

    console.log("Knowledge base seeded")
    process.exit(0)
}

seedKnowledge().catch(error => {
    console.error(error)
    process.exit(1)
})