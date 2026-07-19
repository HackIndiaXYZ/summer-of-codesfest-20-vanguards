export async function generateGeminiResponse(systemPrompt: string, userPrompt: string): Promise<string> {

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt })
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to communicate with the backend server.')
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.'
}
