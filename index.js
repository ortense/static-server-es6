import http from 'http'
import path from 'path'
import fs   from 'fs-promise'
import mime from 'mime-types'

const PORT = process.env.PORT || 3000
const DIR  = path.resolve(process.env.DIR  || __dirname)

const readFile = async (url) => {
	const filePath  = path.join(DIR, url)
	const fileExist = await fs.exists(filePath)

	if(!fileExist) return false

	return await fs.readFile(filePath, {encoding:'utf8'})
}

const renderError = (error, response) => {
	console.log(error)
	response.writeHead(500, {'Content-Type': 'text/html'})
	response.end(`
			<h1>500 - Internal server error!</h1>
			<p>${error}</p>`)
}

const pageNotFound = (request, response) => {
	response.writeHead(404, {'Content-Type': 'text/html'})
	response.end(`<h1>404 - Page not found!</h1>`)
}

const handler = async (request, response) => {
	const url = request.url === '/' ? '/index.html' : request.url

	try {
		const contentType = mime.lookup(url)
		const content = await readFile(url)

		if(!contentType) pageNotFound(response, response)
		else if(content) {
			response.writeHead(404, {'Content-Type': contentType})
			response.end(content)
		}
		else pageNotFound(response, response)
	}
	catch (e) { renderError(e, response) }
}

http.createServer(handler)
	.listen(PORT, _ =>
		console.log(`Server running at http://localhost:${PORT}/`))
