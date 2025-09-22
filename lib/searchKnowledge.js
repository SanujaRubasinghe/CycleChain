import { dbConnect } from "./mongodb";
import Knowledge from "@/models/Knowledge";


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

export async function searchKnowledge(query, topK=3) {
    await dbConnect()

    const queryEmbedding = await generateEmbedding(query)

    const results = await Knowledge.aggregate([
        {
            $vectorSearch:{
                queryVector: queryEmbedding,
                path: "embedding",
                numCandidates: 100,
                limit: topK,
                index: "vector_index"
            }
        }
    ])
    return results
}