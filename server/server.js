const fs = require('fs');
const path = require('path');
const { Tree } = require('tree-sitter');
const { createServer } = require('lsp');

// Load Tree-sitter grammar
const grammarPath = path.join(__dirname, '../src/grammar.json');
const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));

// Initialize Tree-sitter parser
const parser = new Tree();

// Initialize Language Server
const server = createServer({
  async parse(source, uri) {
    const tree = parser.parse(source);
    // You can use the tree to extract information for LSP features
    return { tree, scope: {} };
  },
});

// Listen for LSP messages
process.stdin.pipe(server.stream).pipe(process.stdout);

