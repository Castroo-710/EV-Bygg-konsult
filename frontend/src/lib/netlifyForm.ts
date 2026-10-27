// Netlify Forms only works on a deployed site (not in `npm run dev`).
// Each form name must also exist as a static form in index.html.
export async function submitNetlifyForm(formName: string, form: HTMLFormElement): Promise<void> {
  const data = new FormData(form)
  data.set('form-name', formName)
  data.set('source', window.location.pathname + window.location.search)

  const body = new URLSearchParams()
  data.forEach((value, key) => {
    if (typeof value === 'string') body.append(key, value)
  })

  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`Form submission failed: ${res.status}`)
}
