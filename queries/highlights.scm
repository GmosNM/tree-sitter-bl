
(keyword) @keyword
(operator) @operator
(builtin_procedure) @label
(identifier) @variable
(bool_literal) @boolean
(builtin_type) @type
(int_literal) @number
(interpreted_string_literal) @string
(escape_sequence) @string.escape
(function_definition name: (identifier) @function)
(enum_definition name: (identifier) @function)
(enum_block element: (field_identifier) @variable.parameter)
(identifier_access element: (field_identifier) @variable.parameter)
(field_identifier) @property

(comment) @comment
