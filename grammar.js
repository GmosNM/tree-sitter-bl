const PREC = {
  bitwise_and: 17,
  logical_or: 16,
  logical_and: 15,
  equal: 14,
  offsetof: 12,
  shift: 11,
  add: 10,
  multiply: 9,
  attributes: 8,
  primary: 7,
  unary: 6,
  multiplicative: 5,
  additive: 4,
  comparative: 3,
  and: 2,
  or: 1,
  resolve: 1,
  composite_literal: -1,
};


const unicode_digit = /[0-9]/;
const unicode_letter = /[a-zA-Zα-ωΑ-Ωµ]/;
const unicode_letter_lower = /[a-zα-ωµ]/;
const unicode_letter_upper = /[A-ZΑ-Ω]/;

const letter = choice(unicode_letter, "_");

const hex_digit = /[0-9a-fA-F]/;
const octal_digit = /[0-7]/;
const decimal_digit = /[0-9]/;
const binary_digit = /[01]/;

const hex_digits = seq(hex_digit, repeat(seq(optional("_"), hex_digit)));
const octal_digits = seq(octal_digit, repeat(seq(optional("_"), octal_digit)));
const decimal_digits = seq(
  decimal_digit,
  repeat(seq(optional("_"), decimal_digit))
);
const binary_digits = seq(
  binary_digit,
  repeat(seq(optional("_"), binary_digit))
);

const decimal_exponent = seq(
  choice("e", "E", "f", "F"),
  optional(choice("+", "-")),
  decimal_digits
);

const decimal_float_literal = choice(
  seq(decimal_digits, ".", optional(decimal_digits), optional(decimal_exponent), optional("f")),
  seq(decimal_digits, optional(decimal_exponent), optional("f")),
  seq(".", decimal_digits, optional(decimal_exponent), optional("f"))
);

const hex_literal = seq("0", choice("x", "X"), optional("_"), hex_digits);
const octal_literal = seq(
  "0",
  optional(choice("o", "O")),
  optional("_"),
  octal_digits
);
const decimal_literal = choice(
  "0",
  seq(/[1-9]/, optional(seq(optional("_"), decimal_digits)))
);
const binary_literal = seq("0", choice("b", "B"), optional("_"), binary_digits);

const int_literal = choice(
  binary_literal,
  decimal_literal,
  octal_literal,
  hex_literal
);



const hex_exponent = seq(
  choice("p", "P"),
  optional(choice("+", "-")),
  decimal_digits
);
const hex_mantissa = choice(
  seq(optional("_"), hex_digits, ".", optional(hex_digits)),
  seq(optional("_"), hex_digits),
  seq(".", hex_digits)
);
const hex_float_literal = seq(
  "0",
  choice("x", "X"),
  hex_mantissa,
  hex_exponent
);
const float_literal = choice(decimal_float_literal, hex_float_literal);


const builtin_type_keywords = [
    "s8",
    "s16",
    "s32",
    "s64",
    "u8",
    "u16",
    "u32",
    "u64",
    "usize",
    "bool",
    "f32",
    "f64",
    "type",
    "Any",
];


const  multiplicative_operators = ['*', '/', '%', '%%', '<<', '>>', '&', '&~'];
const  additive_operators = ['+', '-', '~', '|'];
const  comparison_operators = ['>', '<', '<=', '>=', '==', '!='];
const  assignment_operators = ['=','=='];


const _assignment_operators = [
    '+=',
    ':=',
    '=',
    '-=',
]

const binary_operators = [
    '=',
    '==',
    '!=',
    '<=',
    '>=',
    '<',
    '>',
    '+',
    '-',
    '*',
]

module.exports = grammar({
    name: 'biscuit_language',

    externals: ($) => [
        $._automatic_separator,
        $._braced_interpolation_opening,
        $._unbraced_interpolation_opening,
        $._interpolation_closing,
        $._c_string_opening,
        $._raw_string_opening,
        $._string_opening,
        $._string_content,
        $._string_closing,
        $._comment
    ],

    conflicts: $ => [
        [$._statement, $._simple_statement],
        [$.mutable_decl, $.setter],
        [$._field_identifier, $._identifier_operator, $._expression],
        [$.identifier_access],
        [$.local_function_definition, $._field_identifier],
        [$._field_identifier, $.builtin_type],
        [$._field_identifier, $.builtin_type, $._identifier_operator, $._expression],
        [$._element_key, $._expression],
        [$.function_call, $._field_identifier, $.builtin_type, $._identifier_operator, $._expression],
        [$.function_call, $._expression],
        [ $.function_call, $._field_identifier],
        [$.enum_block],
        [$.nested_enum, $._field_identifier],
        [$.using_statement, $._field_identifier],
        [$._top_level_declaration, $._declarator],
        [$.struct_definition, $.local_function_definition, $._field_identifier],
        [$.struct_definition, $._field_identifier],
        [$.enum_definition, $.struct_definition, $.local_function_definition, $.function_definition, $.function_declaration, $._field_identifier],
        [$.nested_enum, $.struct_function_declaration, $._field_identifier],
        [$.struct_function_declaration],
        [$.return_list, $.builtin_type],
        [$.procedure],
        [$.struct_access, $.identifier_access],
        [$.slice_access, $.struct_access, $.identifier_access],
        [$.slice_access, $.struct_access],
        [$.keyed_element],
        [$.function_call, $._field_identifier, $.builtin_type],
        [$._field_identifier, $._identifier_operator],
        [$._identifier_operator, $._expression],
        [$._field_identifier, $.builtin_type, $._identifier_operator],
        [$.function_call, $._identifier_operator, $._expression],
        [$._identifier_operator],
    ],

    extras: $ => [
        $.comment,
        /\s/
    ],
 rules: {
    source_file: ($) =>
      repeat(
        seq(
          choice($._top_level_declaration, $._statement),
        )
      ),


     escape_sequence: ($) =>
     token(
         prec(
             1,
             seq(
                 "\\",
                 choice(
                     /u[a-fA-F\d]{4}/,
                     /U[a-fA-F\d]{8}/,
                     /x[a-fA-F\d]{2}/,
                     /\d{3}/,
                     /\r?\n/,
                     /['"abfrntv\$\\]/,
                     /\S/
                 )
             )
         )
     ),


     binary_expression: $ => prec.left(1, seq(
         field('left', $._expression),
         alias(choice(...binary_operators), $.operator),
         field('right', $._expression),
     )),


     _top_level_declaration: ($) =>
     choice(
         $.function_definition,
         $.enum_definition,
         $.struct_definition,
         $.procedure,
         $.function_declaration,
     ),

     _statement: $ => choice(
         $._simple_statement,
         $.block_statement,
         $.defer_statement,
         $.using_statement,
         $.if_statement,
     ),


     defer_statement: $ => seq(
         alias('defer', $.keyword),
         choice(
             $._simple_statement,
             $.block_statement,
         ),
     ),

     block_statement: $ => prec(1, seq(
         $.block,
     )),


     _simple_statement: $ => choice(
         $.function_call,
         $.return_statement,
     ),

     function_call:  $ => seq(
         choice(
             field('name', $.identifier),
             field('name', $.identifier_access),
         ),
         field('arguments', $.parameter_list),
         optional(
             $.return_list,
         ),
         alias(';', $.operator),
     ),

     return_list: $ => seq(
         '(',
             optional(
                 seq(
                     choice(
                         $.builtin_type,
                         $.identifier,
                     ),
                     optional(
                         seq(
                             alias(':', $.operator),
                         ),
                     ),
                     optional(
                         seq(
                             choice(
                                 $.builtin_type,
                                 $.identifier,
                             ),
                         ),
                     ),
                     optional($.parameter_list),
                 ),
             ),
             repeat(
                 seq(
                     choice(",", $._automatic_separator),
                     choice(
                         $.builtin_type,
                         $.identifier,
                     ),
                     optional(
                         seq(
                             alias(':', $.operator),
                         ),
                     ),
                     optional(
                         seq(
                             choice(
                                 $.builtin_type,
                                 $.identifier,
                             ),
                         ),
                     ),
                 )
             ),
         ')'
     ),

     _expression_pack: $ => prec.left(list1(',', $._expression)),


    using_statement: $ => seq(
        alias('using', $.keyword),
        field('name', choice(
            $.identifier,
            $.identifier_access,
        )),
        alias(';', $.operator),
    ),


     nested_enum: $ => seq(
         field('name', seq($.identifier)),
         alias(':', $.operator),
         alias('enum', $.keyword),
         $.enum_block,
     ),

     enum_block: $ => seq(
         '{',
                 repeat(
                     seq(
                         field('element', seq($._field_identifier)),
                         optional(
                             seq(
                                 alias('=', $.operator),
                                 field('value', $._expression),
                             ),
                         ),
                         optional(
                             alias(';', $.operator),
                         ),
                     ),
                 ),
                 '}',
         optional(
             alias(';', $.operator),
         ),
     ),

     enum_definition: $ => seq(
         field('name', seq($.identifier)),
         '::',
         alias('enum', $.keyword),
         optional($.builtin_type),
         $.enum_block,
         optional(
             alias(';', $.operator),
         ),
     ),

     struct_function_declaration: $ => seq(
         field('name', seq($.identifier)),
         ':',
         optional(
             alias('*', $.operator),
         ),
         alias('fn', $.keyword),
         $.parameter_list,
         optional(
             $.return_list,
         ),
         optional(
             field('type', seq($.builtin_type)),
         ),
         optional(
             alias(';', $.operator),
         ),
     ),

     struct_block: $ => seq(
         '{',
                 repeat(
                     choice(
                         $.nested_enum,
                         $.struct_function_declaration,
                         seq(
                             field('element', seq($._field_identifier)),
                             alias(':', $.operator),
                             field('type', seq($.builtin_type)),
                             optional(
                                 alias(';', $.operator),
                             ),
                         ),
                     ),
                 ),
         '}'
     ),

     struct_definition: $ => seq(
         field('name', seq($.identifier)),
         '::',
         alias('struct', $.keyword),
         optional(
             repeat(
                 seq(
                     choice(
                         alias('#compiler', $.procedure),
                         alias('#base', $.procedure),
                     ),
                     optional(
                         $.identifier,
                     ),
                 ),
             ),
         ),
         $.struct_block,
         optional(
             alias(';', $.operator),
         ),
     ),


     local_function_definition: $ => seq(
         field('name', seq($.identifier)),
         '::',
         alias('fn', $.keyword),
         $.parameter_list,
         field('type', seq($.builtin_type)),
         optional($.builtin_procedure),
         $.block,
         alias(';', $.operator),
     ),

     function_definition: $ => seq(
         field('name', seq($.identifier)),
         '::',
         alias('fn', $.keyword),
         $.parameter_list,
         optional(
             $.return_list,
         ),
         field('type', seq($.builtin_type)),
         optional($.builtin_procedure),
         $.block
     ),


     function_declaration: $ => seq(
         field('name', seq($.identifier)),
         alias('::', $.operator),
         alias('fn', $.keyword),
         $.parameter_list,
         field('type', seq($.builtin_type)),
         optional($.builtin_procedure),
         alias(';', $.operator),
     ),

     loop_statement: $ => choice(
         // infinite loop
         prec.left(1, seq(
             alias('loop', $.keyword),
             $.block,
         )),

         // Loop without initialization and increment
         prec.left(1, seq(
             alias('loop', $.keyword),
             field('condition', $._expression),
             $.block,
         )),

         // Loop with initialization, condition, and increment
         prec.left(1, seq(
             alias('loop', $.keyword),
             field('init', $._declarator),
             field('condition', $._expression),
             token(';'),
             field('increment', $._declarator),
             $.block,
         )),
     ),

     switch_statement: $ => prec.left(1, seq(
         alias('switch', $.keyword),
         field('condition', seq($._expression)),
         token('{'),
         repeat($._expression),
         optional(
             seq(
                 alias('default', $.keyword),
                 optional($.block),
                 optional(alias(';', $.operator)),
             ),
         ),
         token('}'),
     )),

     if_statement: $ => prec.left(1, seq(
         alias('if', $.keyword),
         optional('!'),
         field('condition', seq($._expression)),
         $.block,
         optional($.else_statement)
     )),

     else_statement: $ => prec.left(1, seq(
         alias('else', $.keyword),
         optional($.if_statement),
         optional($.block)
     )),


     null: _ => 'null',
     true: _ => 'true',
     false: _ => 'false',

     _string_literal: ($) =>
     choice(
         $.c_string_literal,
         $.raw_string_literal,
         $.interpreted_string_literal
     ),

     c_string_literal: ($) => 
     interpolated_quoted_string($, $._c_string_opening),

         raw_string_literal: ($) => 
      quoted_string($, $._raw_string_opening),

    interpreted_string_literal: ($) => 
      interpolated_quoted_string($, $._string_opening),


    string_interpolation: ($) =>
      choice(
        seq(
          $._braced_interpolation_opening,
          $._expression,
          $._interpolation_closing
        ),
        seq(
          $._unbraced_interpolation_opening,
          choice(
            $.identifier,
          )
        )
      ),

     float_literal: ($) => token(float_literal),
     int_literal: ($) => token(int_literal),

     parameter_list: $ => seq(
         '(',
             optional(
                 seq(
                     choice(
                         $._expression,
                         $.keyed_element,
                         $.builtin_procedure,
                     ),
                     optional($.parameter_list),
                 ),
             ),
             repeat(
                 seq(
                     choice(",", $._automatic_separator),
                     choice(
                         $._expression,
                         $.keyed_element,
                         $.builtin_procedure,
                     ),
                     optional($.parameter_list),
                 )
             ),
         ')'
     ),


     keyed_element: ($) => seq(
         optional(
             choice(
                 $.slice_access,
                 $.struct_access,
             ),
         ),
         field("argument", $._element_key), 
         optional(
             seq(
                 choice(
                     alias("=", $.operator),
                     alias(":=", $.operator),
                 ),
                 $._expression,
             ),
         ),
         optional($.var_procedure),
         optional(alias(":", $.operator)),
         optional(
             field("type", $.builtin_type),
         ),
         optional($.builtin_procedure),
         optional(
             choice(
                 alias("=", $.operator),
                 alias(":=", $.operator),
             ),
         ),
         optional(
             seq(
                 $.var_procedure,
             ),
         ),
         optional(
             seq(
                 field("default", $._expression),
             ),
         ),
     ),

    _field_identifier: ($) => alias($.identifier, $.field_identifier),

    _element_key: ($) =>
      choice(
        prec(1, $._field_identifier),
        $.builtin_type,
        $._string_literal,
        $.int_literal,
        $.function_call,
      ),

     builtin_type: ($) => seq(
         optional(
             choice(
                 alias('*', $.operator),
                 alias('?', $.operator),
                 alias('*?', $.operator),
             ),
         ),
         optional(
             seq(
                 alias('[', $.operator),
                 optional(seq(
                     choice(
                         $._expression,
                         $.keyed_element,
                         $.builtin_procedure,
                         alias('..', $.operator),
                         alias('...', $.operator),
                     ),
                 ),
                 ),
                 alias(']', $.operator),
             ),
         ),
         choice(
             ...builtin_type_keywords,
             $.identifier,
         ),
     ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),


     break_statement: $ => seq(
         alias('break', $.keyword),
         alias(';', $.operator),
     ),

     continue_statement: $ => seq(
         alias('continue', $.keyword),
         alias(';', $.operator),
     ),

     _statement: $ => choice(
         $.return_statement,
         $.function_call,
         $.defer_statement,
         $.using_statement,
         $.block_statement,
         $._simple_statement,
         $._declarator,
         $.if_statement,
         $.break_statement,
         $.continue_statement,
         $.switch_statement,
         $.loop_statement,
         $.local_function_definition
     ),

     mutable_decl: $ => prec.left(1, seq(
         $._field_identifier,
         alias(':=', $.operator),
         alias($._expression, $.field_identifier),
         optional(
             choice(
                 $.struct_access,
                 $.slice_access,
             ),
         ),
         optional(
             seq(
                 $.parameter_list,
             ),
         ),
         alias(';', $.operator)
     )),

     typed_mutable_decl: $ => prec.left(1, seq(
         $._field_identifier,
         alias(':', $.operator),
         $.builtin_type,
         optional(
             seq(
                 $.var_procedure,
             ),
         ),
         optional(
             seq(
                 alias('=', $.operator),
                 optional(
                     seq(
                         alias("auto", $.keyword),
                     ),
                 ),
                 alias($._expression, $.field_identifier),
             ),
         ),
         optional(
             seq(
                 alias(':', $.operator),
                 alias($._expression, $.field_identifier),
             ),
         ),
         alias(';', $.operator)
     )),

    strcut_initlizer: $ => seq(
        $._field_identifier,
        alias(':', $.operator),
        alias($._expression, $.field_identifier),
        alias(';', $.operator)
    ),


    slice_access: $ => seq(
        alias('.', $.operator),
        alias('{', $.operator),
        optional(
            choice(
                $._field_identifier,
                $._expression,
            ),
        ),
        optional(
            seq(
                repeat(
                    seq(
                        choice(
                            $._field_identifier,
                            $._expression,
                        ),
                        alias(',', $.operator),
                    ),
                ),
            ),
        ),
        alias('}', $.operator),
    ),


    struct_access: $ => seq(
        optional(
            $.builtin_type,
        ),
        alias('.', $.operator),
        alias('{', $.operator),
        optional(
            choice(
                $._field_identifier,
                $._expression,
            ),
        ),
        optional(
            seq(
                repeat(
                    seq(
                        optional(
                            seq(
                                $._field_identifier,
                                alias('=', $.operator),
                            ),
                        ),
                        choice(
                            $._field_identifier,
                            $._expression,
                        ),
                        alias(',', $.operator),
                    ),
                ),
            ),
        ),
        alias('}', $.operator),
    ),

     immutable_decl: $ => prec.left(1, seq(
         repeat(
             seq(
                 $._field_identifier,
                 alias(',', $.operator),
             ),
         ),
         $._field_identifier,
         alias('::', $.operator),
         optional(
             seq(
                 alias("auto", $.keyword),
             ),
         ),
         choice(
             seq(
                 $.builtin_type,
                 $._expression,
             ),
         ),
         optional(
             choice(
                 $.struct_access,
                 $.slice_access,
             ),
         ),
         optional(
             seq(
                 $.parameter_list,
             ),
         ),
         alias(';', $.operator)
     )),


     setter: $ => prec.right(1,seq(
         choice(
             $._field_identifier,
             $.identifier_access,
         ),
         alias(choice(..._assignment_operators), $.operator),
         optional(
             seq(
                 alias("auto", $.keyword),
             ),
         ),
         $._expression,
         alias(';', $.operator)
     )),


     _declarator: $ => choice(
         $.immutable_decl,
         $.mutable_decl,
         $.typed_mutable_decl,
         $.strcut_initlizer,
         $.setter,
     ),

     return_statement: $ => seq(
         alias('return', $.keyword),
         optional(
             seq(
                 alias("auto", $.keyword),
             ),
         ),
         $._expression,
         optional(
             $.parameter_list,
         ),
         optional(
             repeat(
                 seq(
                     $._expression,
                     alias(',', $.operator),
                 ),
             ),
         ),
         alias(';', $.operator)
     ),

     identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,
     bool_literal: $ => choice($.true, $.false),

     identifier_access: $ => seq(
         field('element', $._field_identifier),
         optional(
             repeat(
                 seq(
                     token('.'),
                     field('element', $._field_identifier),
                     optional(
                         seq(
                             $.parameter_list,
                         ),
                     ),
                 ),
             ),

         ),

         optional(
             seq(
                 $.block,
             ),
         ),
     ),

     _identifier_operator: $ => seq(
         optional(
             choice(
                 alias('&', $.operator),
                 alias('@', $.operator),
             ),
         ),
         choice(
             $.identifier,
             $.identifier_access,
         ),
         optional(
             seq(
                 alias("[", $.operator),
                 $._expression,
                 alias("]", $.operator),
             ),
         ),
     ),


     char_literal: $ => seq(
         choice('L\'', 'u\'', 'U\'', 'u8\'', '\''),
         choice(
             $.escape_sequence,
             alias(token.immediate(/[^\n']/), $.character),
         ),
         '\'',
     ),

     _expression: $ => choice(
         $.identifier,
         $.identifier_access,
         $.float_literal,
         $._string_literal,
         $.bool_literal,
         $.binary_expression,
         $._identifier_operator,
         $.char_literal,
         $.null,
         $.int_literal
     ),

    builtin_procedure: $ => token(choice(
        '#inline',
        '#comptime',
        '#test',
        '#file',
        '#extern',
        '#compiler',
    )),

    var_procedure: $ => token(choice(
        '#thread_local',
        '#noinit',
        '#call_location',
    )),

    user_procedure: $ => token(choice(
        '#load',
        '#import',
        '#scope',
        '#private',
    )),

    procedure: $ => seq(
        $.user_procedure,
        optional(
            choice(
                $._string_literal,
                $.identifier,
            ),
        ),
    ),


     comment: $ => token(choice(
         seq('//', /.*/),
         seq(
             '/*',
             /[^*]*\*+([^/*][^*]*\*+)*/,
             '/'
         )
     )),

  }
});



function quoted_string($, opening, ...rules) {
  return seq(
    prec(1, opening),
    repeat(
      choice(
        prec(1, $._string_content),
        ...rules,
      )
    ),
    $._string_closing
  );
}


function interpolated_quoted_string($, opening) {
  return quoted_string($, 
    opening,
    $.escape_sequence,
    $.string_interpolation,
  )
}


function commaSep1(rule) {
  return sep1(rule, ',');
}

function sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}


function list1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)))
}
