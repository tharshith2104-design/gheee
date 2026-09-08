// Zero-dependency local development server for Amrutha Pure Ghee Store
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function parseMultipart(buffer, boundary) {
    const files = [];
    const boundaryBuf = Buffer.from('--' + boundary);
    let start = bufferIndexOf(buffer, boundaryBuf, 0);

    while (start !== -1) {
        const nextStart = bufferIndexOf(buffer, boundaryBuf, start + boundaryBuf.length);
        const part = nextStart !== -1
            ? buffer.slice(start + boundaryBuf.length, nextStart)
            : buffer.slice(start + boundaryBuf.length);

        const headerEnd = bufferIndexOf(part, Buffer.from('\r\n\r\n'), 0);
        if (headerEnd === -1) { start = nextStart; continue; }

        const headers = part.slice(0, headerEnd).toString('utf-8');
        const body = part.slice(headerEnd + 4, part.length - 2); // strip trailing \r\n

        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        const contentTypeMatch = headers.match(/Content-Type:\s*(.+)/i);

        if (filenameMatch && nameMatch) {
            files.push({
                fieldName: nameMatch[1],
                filename: filenameMatch[1],
                contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
                data: body
            });
        }
        start = nextStart;
    }
    return files;
}

function bufferIndexOf(buf, search, from) {
    for (let i = from; i <= buf.length - search.length; i++) {
        let found = true;
        for (let j = 0; j < search.length; j++) {
            if (buf[i + j] !== search[j]) { found = false; break; }
        }
        if (found) return i;
    }
    return -1;
}

function handleUpload(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No multipart boundary found' }));
        return;
    }

    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_FILE_SIZE) {
            req.destroy();
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File too large (max 5MB)' }));
            return;
        }
        chunks.push(chunk);
    });

    req.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const boundary = boundaryMatch[1];
        const files = parseMultipart(buffer, boundary);

        if (files.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No file found in upload' }));
            return;
        }

        const file = files[0];
        const ext = path.extname(file.filename) || '.jpg';
        const safeName = 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext;
        const savePath = path.join(UPLOADS_DIR, safeName);

        fs.writeFile(savePath, file.data, (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to save file' }));
                return;
            }
            const url = '/uploads/' + safeName;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ url: url, filename: safeName }));
        });
    });

    req.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upload failed: ' + err.message }));
    });
}

const server = http.createServer((req, res) => {
    // Clean up url (strip query parameters)
    const cleanUrl = req.url.split('?')[0];

    // Handle file upload endpoint
    if (cleanUrl === '/upload' && req.method === 'POST') {
        handleUpload(req, res);
        return;
    }

    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 File Not Found</h1><p>The file you requested does not exist.</p>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Internal Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` AMRUTHA PURE GHEE - LOCAL TEST SERVER RUNNING `);
    console.log(`==================================================`);
    console.log(`\nStorefront:      http://localhost:${PORT}/index.html`);
    console.log(`Admin Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`\nPress Ctrl+C in this terminal window to stop the server.`);
    console.log(`==================================================`);
});
