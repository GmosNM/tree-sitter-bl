(procedure)@constant.macro
(keyword) @keyword
(operator) @operator
(builtin_procedure) @label
(var_procedure) @label
(identifier) @variable
(bool_literal) @boolean
(builtin_type) @type
(escape_sequence) @string.escape
(function_definition name: (identifier) @function)
(enum_definition name: (identifier) @function)
(enum_block element: (field_identifier) @variable.parameter)
(struct_definition name: (identifier) @function)
(struct_block element: (field_identifier) @variable.parameter)
(identifier_access element: (field_identifier) @parameter)
(field_identifier) @property

(function_call
  name: (identifier) @function.builtin
  (.match? @function.builtin "^(print|assert|sizeof|typeof|alignof|typeinfo|typekind|typeid|panic|static_assert|debugbreak)$"))

[
  (interpreted_string_literal)
  (raw_string_literal)
] @string

[
  (int_literal)
  (float_literal)
] @number


[
  (null)
] @constant.builtin


(comment) @comment
