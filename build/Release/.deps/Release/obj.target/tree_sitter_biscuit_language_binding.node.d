cmd_Release/obj.target/tree_sitter_biscuit_language_binding.node := clang++-18 -o Release/obj.target/tree_sitter_biscuit_language_binding.node -shared -pthread -rdynamic -m64  -Wl,-soname=tree_sitter_biscuit_language_binding.node -Wl,--start-group Release/obj.target/tree_sitter_biscuit_language_binding/bindings/node/binding.o Release/obj.target/tree_sitter_biscuit_language_binding/src/parser.o Release/obj.target/tree_sitter_biscuit_language_binding/src/scanner.o -Wl,--end-group 