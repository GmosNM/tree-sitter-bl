#!/usr/bin/env node

/**
 * lsp api exposed via the command line.
 *
 * When called from the command line, parses the command line arguments,
 * calls the required functions from main and prints out the output to the
 * console.
 *
 * @module cli/lsp
 */
var program = require('commander'),
    main = require('../main.js');

/**
 * Define command line arguments
 */
program
    .version('1.1.1')
    .option('-a, --all', 'Show hidden files')
    .option('-d, --depth <n>', 'Depth <int>. Defaults to 0', parseInt, 0)
    .option('--full',
            'List files and directories recursively, with no limit on depth')
    .option('--list-deepest-paths',
            'Lists the deepest paths in the directory tree')
    .parse(process.argv);

/**
 * Prints out the contents of a directory, and it's sub directories to a
 * given depth or till the maximum depth if fullRecurse is true, to the
 * console
 *
 * @param baseDir {string} - path to the directory the contents of which are
 * to be listed
 * @param depth {number} - the maximum depth, relative to the base directory
 * till will results are be to fetched recursively. Defaults to 0
 * @param showHidden {boolean} - whether to list hidden files and directories.
 * Defaults to false
 * @param fullRecurse {boolean} - whether to fetch contents of all sub
 * directories of the base directory. Defaults to false
 */
var lsp = function(baseDir, depth, showHidden, fullRecurse) {
    var data = main.walkDir(baseDir, 0, depth, showHidden, fullRecurse),
        output = main.prettyPrint(data, 0, 'name', true);

    console.log(output);
};

/**
 * Prints out the number of files and subdirectories that are at the deepest
 * level from the base direcotry and their level relative to the base
 * directory, along with each path, to the console.
 *
 * @param baseDir {string} - path of the directory for which the deepest paths
 * are to be listed
 */
var listDeepestPaths = function(baseDir) {
    var data = main.getDeepestPaths(baseDir, program.all),
        output = main.prettyPrint(data.deepestPaths, 0, 'path', false);

    output = data.deepestPaths.length +
             ' path(s) at a depth of ' +
             data.maxDepth +
             '\n' +
             output;

    console.log(output);
};

/**
 * Helper method that calls either lsp or listDeepestPaths based on the
 * arguments passed via the command line.
 */
var cli = function() {
    if (program.listDeepestPaths) {
        listDeepestPaths(process.cwd());
    } else {
        lsp(process.cwd(), program.depth, program.all, program.full);
    }
};

/** Run cli */
cli();
