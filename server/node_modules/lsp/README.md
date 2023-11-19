# lsp
Simple implementation of ls in node. The results are displayed in a list format, i.e. one result per line. You can also list subdirectories recursively by passing the depth as an argument.

    Installation
    sudo npm install -g lsp


    Usage: lsp [options]

    Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -a, --all             Show hidden files
    -d, --depth <n>       Depth <int>. Defaults to 0
    --full                List files and directories recursively, with no limit on depth
    --list-deepest-paths  Lists the deepest paths in the directory tree


    List the contents of the current directory, excluding hidden files and directories

        lsp

    List the content of subdirectories up to a depth of 3

        lsp -d 3

    List the contents of the current directory, including hidden files and directories

        lsp -a

    List the contents of the current directory, and subdirectories upto a depth
    of 3, including hidden files and directories

        lsp -a -d 3

    List the deepest path(s) in the directory tree, excluding hidden files and
    directories

        lsp --list-deepest-paths

    ist the deepest path(s) in the directory tree, including hidden files and
    directories

        lsp --list-deepest-paths --all
