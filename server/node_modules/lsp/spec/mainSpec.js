var path = require('path'),
    main = require('../main.js');

var projectDir = path.dirname(__dirname);

describe('Test suite for walkDir', function() {

    it('test without any inputs', function() {
        var expected = [
                {
                    'depth': 0,
                    'name': 'LICENSE',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'README.md',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'bin/',
                    'isDir': true
                },
                {
                    'depth': 0,
                    'name': 'doc/',
                    'isDir': true
                },
                {
                    'depth': 0,
                    'name': 'main.js',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'man/',
                    'isDir': true
                },
                {
                    'depth': 0,
                    'name': 'package.json',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'spec/',
                    'isDir': true
                },
            ];

        var output = main.walkDir(projectDir, 0, 0, false, false);

        expect(output.length).toEqual(expected.length);
        for (var i = 0; i < output.length; i++) {
            expect(output[i].name).toEqual(expected[i].name);
            expect(output[i].isDir).toEqual(expected[i].isDir);
            expect(output[i].depth).toEqual(expected[i].depth);
        }
    });
});

describe('Test suite for prettyPrint', function() {
    it('Test with custom input', function() {
        var expected = [
                '\u001b[34mLICENSE\u001b[39m',
                '\u001b[34mREADME.md\u001b[39m',
                '\u001b[32m\u001b[4mbin/\u001b[24m\u001b[39m',
                '\u001b[32m\u001b[4mdoc/\u001b[24m\u001b[39m',
                '\u001b[34mmain.js\u001b[39m',
                '\u001b[32m\u001b[4mman/\u001b[24m\u001b[39m',
                '\u001b[34mpackage.json\u001b[39m',
                '\u001b[32m\u001b[4mspec/\u001b[24m\u001b[39m\n'
            ].join('\n'),
            data = [
                {
                    'depth': 0,
                    'name': 'LICENSE',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'README.md',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'bin/',
                    'isDir': true
                },
                {
                    'depth': 0,
                    'name': 'doc/',
                    'isDir': true
                },
                {
                    'depth': 0,
                    'name': 'main.js',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'man/',
                    'isDir': true
                },
                {
                    'depth': 0,
                    'name': 'package.json',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'spec/',
                    'isDir': true
                },
            ];

        var output = main.prettyPrint(data, 0, 'name', true);

        expect(output).toEqual(expected);
    });
});

describe('Test suit for makeSenseOfStats', function() {
    it('Test main ../main.js', function() {
        var expected = {
                'depth': 0, 
                'name': 'main.js',
                'isDir': false,
            };

        var output = main.makeSenseOfStats('main.js', projectDir, 0, 0, false);

        expect(output.name).toEqual(expected.name);
        expect(output.isDir).toEqual(expected.isDir);
        expect(output.depth).toEqual(expected.depth);
    });
});

describe('Test suit for getDeepestPaths', function() {
    it('Get deepest paths in project dir', function() {
        var expected = {
                'maxDepth': 1,
                'deepestPaths': [
                    {
                        'depth': 1,
                        'name': 'lsp.js',
                        'isDir': false
                    },
                    {
                        'depth': 1,
                        'name': 'lsp/',
                        'isDir': true
                    },
                    {
                        'depth': 1,
                        'name': 'manpage.1',
                        'isDir': false
                    },
                    {
                        'depth': 1,
                        'name': 'mainSpec.js',
                        'isDir': false
                    }
                ]
            };

        var output = main.getDeepestPaths(projectDir, false);

        expect(output.maxDepth).toEqual(expected.maxDepth);
        expect(output.deepestPaths.length).toEqual(expected.deepestPaths.length);
        for (i = 0; i < output.deepestPaths.length; i++) {
            expect(output.deepestPaths[i].name).toEqual(expected.deepestPaths[i].name);
            expect(output.deepestPaths[i].isDir).toEqual(expected.deepestPaths[i].isDir);
            expect(output.deepestPaths[i].depth).toEqual(expected.deepestPaths[i].depth);
        }
    });
});

describe('Test suit for flattenDirTree', function() {
    it('Flatten project directory', function() {
        var expected = [
                {
                    'depth': 0,
                    'name': 'LICENSE',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'README.md',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'bin/',
                    'isDir': true,
                },
                {
                    'depth': 0,
                    'name': 'doc/',
                    'isDir': true,
                },
                {
                    'depth': 0,
                    'name': 'main.js',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'man/',
                    'isDir': true,
                },
                {
                    'depth': 0,
                    'name': 'package.json',
                    'isDir': false
                },
                {
                    'depth': 0,
                    'name': 'spec/',
                    'isDir': true,
                },
                {
                    'depth': 1,
                    'name': 'lsp.js',
                    'isDir': false
                },
                {
                    'depth': 1,
                    'name': 'lsp/',
                    'isDir': true
                },
                {
                    'depth': 1,
                    'name': 'manpage.1',
                    'isDir': false
                },
                {
                    'depth': 1,
                    'name': 'mainSpec.js',
                    'isDir': false
                }
            ];

        var dirTree = main.walkDir(projectDir, 0, 0, false, true),
            output = main.flattenDirTree(dirTree);

        expect(output.length).toEqual(expected.length);
        for (var i = 0; i < output.length; i++) {
            expect(output[i].name).toEqual(expected[i].name);
            expect(output[i].isDir).toEqual(expected[i].isDir);
            expect(output[i].depth).toEqual(expected[i].depth);
        }
    });
});
