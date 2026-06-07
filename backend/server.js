const express = require('express')
const cors = require('cors')
const profileModule = require('./routes/profile')
const profileRouter = profileModule.router

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', profileRouter)

// Shareable per-division HTML for social previews (meta tags)
app.get('/divisi/:key', (req,res)=>{
	const key = req.params.key
	const divisions = profileModule.divisions || []
	const found = divisions.find(d=>d.key === key)
	if (!found) return res.status(404).send('Division not found')

	const frontendHost = process.env.FRONTEND_HOST || 'http://localhost:5173'
	const url = `${frontendHost}/divisi/${encodeURIComponent(key)}`
	const title = `${found.name} — ${profileModule.router ? '' : ''}`
	const description = found.description || ''
	const image = found.avatar || ''

	const html = `<!doctype html>
	<html lang="id">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>${escapeHtml(found.name)}</title>
			<meta name="description" content="${escapeHtml(description)}" />
			<meta property="og:type" content="website" />
			<meta property="og:title" content="${escapeHtml(found.name)}" />
			<meta property="og:description" content="${escapeHtml(description)}" />
			<meta property="og:image" content="${escapeHtml(image)}" />
			<meta property="og:url" content="${escapeHtml(url)}" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content="${escapeHtml(found.name)}" />
			<meta name="twitter:description" content="${escapeHtml(description)}" />
			<meta name="twitter:image" content="${escapeHtml(image)}" />
			<meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
		</head>
		<body>
			Redirecting to <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>
		</body>
	</html>`

	res.send(html)
})

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log(`API server listening on port ${port}`))

function escapeHtml(str){
	return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
