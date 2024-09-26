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
        {
          role: "system",
          content: "You are an AI assistant helping to generate quiz questions. Engage in a conversation to understand the topic, difficulty level, and number of questions desired. When generating questions, format them as numbered pairs with 'Question:' and 'Answer:' labels. Each question-answer pair should be separated by a blank line. For math questions or any questions requiring multiple lines, include all parts of the question or answer together without additional numbering. For example:\n\n1. Question: What is the capital of France?\nAnswer: Paris\n\n2. Question: Solve the equation:\nx + 5 = 12\nAnswer: x = 7\n\n3. Question: List the first three prime numbers.\nAnswer: 2, 3, 5"
        },
        ...messages
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