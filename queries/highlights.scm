
(call_expression
  function: (identifier) @function)


(function_item (identifier) @function)
(function_signature_item (identifier) @function)

(line_comment) @comment
(block_comment) @comment

(parameter (identifier) @variable.parameter)


(type_identifier) @type
(primitive_type) @type.builtin
(field_identifier) @property

(flags) @label

(char_literal) @string
(string_literal) @string
(raw_string_literal) @string

(escape_sequence) @string.escape

(integer_literal) @constant.builtin
(float_literal) @constant.builtin
(boolean_literal) @constant.builtin
(null_literal) @constant



"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket


"::" @punctuation.delimiter
":=" @punctuation.delimiter
":" @punctuation.delimiter

"fn" @keyword
"enum" @keyword
"struct" @keyword
"return" @keyword
"if" @keyword
"else" @keyword
"defer" @keyword
"loop" @keyword
"switch" @keyword
"auto" @keyword
"default" @keyword
"cast" @keyword


"#import" @keyword
"#load" @keyword
"#scope" @keyword
"#private" @keyword


";" @punctuation.delimiter
"," @punctuation.delimiter



"*" @operator
"&" @operator
"*?" @operator
"!" @operator
