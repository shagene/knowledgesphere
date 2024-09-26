import { NextApiRequest, NextApiResponse } from 'next'
import { Mistral } from "@mistralai/mistralai"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  try {
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set in environment variables')
    }

    const client = new Mistral({ apiKey })

    const chatResponse = await client.chat.complete({
      model: "mistral-medium",
      messages: [
        ...messages,
        {
          role: "system",
          content: "Please format your responses with numbered questions and answers, each on a separate line. For example:\n\n1. Question: What is the capital of France?\n   Answer: Paris\n\n2. Question: Who wrote 'Romeo and Juliet'?\n   Answer: William Shakespeare"
        }
      ],
    })

    if (!chatResponse.choices || chatResponse.choices.length === 0) {
      throw new Error('No choices received from Mistral AI')
    }

    const content = chatResponse.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from Mistral AI')
    }

    res.status(200).json({ message: content })
  } catch (error) {
    console.error('Error in chat:', error)
    res.status(500).json({ error: 'Failed to process chat' })
  }
}