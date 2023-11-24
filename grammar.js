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
  choice("e", "E"),
  optional(choice("+", "-")),
  decimal_digits
);
const decimal_float_literal = choice(
  seq(decimal_digits, ".", decimal_digits, optional(decimal_exponent)),
  seq(decimal_digits, decimal_exponent),
  seq(".", decimal_digits, optional(decimal_exponent))
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
        [$._expression, $.binary_expression],
        [$.identifier, $._field_identifier],
        [$.enum_definition, $.function_definition, $._field_identifier],
        [$._field_identifier, $._expression],
        [$.mutable_decl, $.setter],
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
          optional($._automatic_separator)
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
         field('name', $._field_identifier),
         field('arguments', $.parameter_list),
         alias(';', $.operator),
     ),

     _expression_pack: $ => prec.left(list1(',', $._expression)),


    using_statement: $ => seq(
        alias('using', $.keyword),
        field('name', $.identifier),
        alias(';', $.operator),
    ),

    enum_block: $ => seq(
      '{',
          repeat(
              seq(
                  field('element', seq($._field_identifier)),
                  alias(';', $.operator),
              ),
          ),
      '}'
    ),

     enum_definition: $ => seq(
         field('name',seq($.identifier)),
         '::',
         alias('enum', $.keyword),
         optional($.builtin_type),
         $.enum_block,
         alias(';', $.operator),
     ),


     function_definition: $ => seq(
         field('name', seq($.identifier)),
         '::',
         alias('fn', $.keyword),
         $.parameter_list,
         field('type', seq($.builtin_type)),
         optional($.builtin_procedure),
         $.block
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


     if_statement: $ => prec.left(1, seq(
         alias('if', $.keyword),
         field('condition', seq($._expression)),
         $.block,
         optional($.else_statement)
     )),

     else_statement: $ => prec.left(1, seq(
         alias('else', $.keyword),
         optional($.if_statement),
         optional($.block)
     )),


     _true: ($) => "true",
     _false: ($) => "false",

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
                     ),
                 ),
             ),
             repeat(
                 seq(
                     choice(",", $._automatic_separator),
                     choice(
                         $._expression,
                         $.keyed_element,
                     )
                 )
             ),
         ')'
     ),



    keyed_element: ($) => seq(
      field("argument", $._element_key), 
      ":",
      field("type", $.builtin_type)
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

    builtin_type: ($) => choice(...builtin_type_keywords),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),


     break_statement: $ => seq(
         alias('break', $.keyword),
         ';',
     ),

     continue_statement: $ => seq(
         alias('continue', $.keyword),
         ';',
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
         $.loop_statement
     ),

     immutable_decl: $ => prec.left(1, seq(
         $._field_identifier,
         alias('::', $.operator),
         $._expression,
         alias(';', $.operator)
     )),

     mutable_decl: $ => prec.left(1, seq(
         $._field_identifier,
         alias(':=', $.operator),
         alias($._expression, $.field_identifier),
         alias(';', $.operator)
     )),

     typed_mutable_decl: $ => prec.left(1, seq(
         $._field_identifier,
         alias(':', $.operator),
         $.builtin_type,
         alias(';', $.operator)
     )),


     typed_immutable__decl: $ => prec.left(1, seq(
         $._field_identifier,
         alias('::', $.operator),
         $.builtin_type,
         alias(';', $.operator)
     )),


     setter: $ => prec.right(1,seq(
         $._field_identifier,
         alias(choice(..._assignment_operators), $.operator),
         $._expression,
         alias(';', $.operator)
     )),


     _declarator: $ => choice(
         $.immutable_decl,
         $.mutable_decl,
         $.typed_mutable_decl,
         $.typed_immutable__decl,
         $.setter,
     ),

    return_statement: $ => seq(
      alias('return', $.keyword),
      $._expression,
      alias(';', $.operator)
    ),

     identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,
     bool_literal: $ => choice($._true, $._false),

     identifier_access: $ => seq(
         field('element', $._field_identifier),
         token('.'),
         field('element', $._field_identifier),
     ),

     _expression: $ => choice(
         $.identifier,
         $.identifier_access,
         $.float_literal,
         $._string_literal,
         $.bool_literal,
         $.binary_expression,
         $.int_literal
     ),

    builtin_procedure: $ => token(choice(
        '#inline',
        '#comptime',
    )),

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
