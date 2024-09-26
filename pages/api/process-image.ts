import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import { Mistral } from "@mistralai/mistralai"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' })
      }

      const file = Array.isArray(files.image) ? files.image[0] : files.image
      if (!file) {
        return res.status(400).json({ error: 'No image file provided' })
      }

      const imageBuffer = fs.readFileSync(file.filepath)
      const base64Image = imageBuffer.toString('base64')

      const apiKey = process.env.MISTRAL_API_KEY
      if (!apiKey) {
        throw new Error('MISTRAL_API_KEY is not set in environment variables')
      }

      const client = new Mistral({ apiKey })

      const chatResponse = await client.chat.complete({
        model: "pixtral-12b",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract question-answer pairs from this image. Format the response as 'Question: Answer' pairs, one per line." },
              {
                type: "image_url",
                imageUrl: `data:image/jpeg;base64,${base64Image}`,
              },
            ],
          },
        ],
      })

      if (!chatResponse.choices || chatResponse.choices.length === 0) {
        throw new Error('No choices received from Mistral AI')
      }

      const content = chatResponse.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from Mistral AI')
      }

      const pairs = processMistralResponse(content)

      res.status(200).json({ pairs })
    })
  } catch (error) {
    console.error('Error processing image:', error)
    res.status(500).json({ error: 'Failed to process image' })
  }
}

function processMistralResponse(content: string): { question: string; answer: string }[] {
  const pairs = content.split('\n\n').filter(Boolean)
  return pairs.map(pair => {
    const [questionLine, answerLine] = pair.split('\n').map(line => line.trim())
    const question = questionLine.replace(/^(\d+\.?\s*)?(Q(uestion)?:?\s*)?/i, '')
    const answer = answerLine.replace(/^(A(nswer)?:?\s*)?/i, '')
    return { question, answer }
  })
}