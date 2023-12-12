const PREC = {
  call: 15,
  field: 14,
  try: 13,
  unary: 12,
  cast: 11,
  multiplicative: 10,
  additive: 9,
  shift: 8,
  bitand: 7,
  bitxor: 6,
  bitor: 5,
  comparative: 4,
  and: 3,
  or: 2,
  range: 1,
  assign: 0,
  closure: -1,
};


const builtin_types = [
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
    "string_view",
    "string",
    "Error",
];


module.exports = grammar({
    name: 'biscuit',

    extras: $ => [
        /\s/,
        $.line_comment,
        $.block_comment,
    ],

    externals: $ => [
        $._string_content,
        $.raw_string_literal,
        $.float_literal,
        $.block_comment,
    ],

    supertypes: $ => [
        $._expression,
        $._type,
        $._literal,
        $._declaration_statement,
    ],

    inline: $ => [
        $._type_identifier,
        $._field_identifier,
        $._declaration_statement,
    ],

    conflicts: $ => [
        [$.range_expression],
        [$.field_access_expression],
        [$.field_expression, $.field_access_expression],
        [$._expression_except_range, $.declaration_expr],
        [$._expression_except_range, $._type],
        [$.declaration_expr, $._type],
        [$._expression_except_range, $.declaration_expr, $._type],
        [$.field_expression],
        [$.pointer_type],
        [$.pointer_or_null_type],
        [$.array_type],
        [$.null_type],
        [$.parameter],
        [$.assignment_expression, $.pointer_type],
        [$.compound_assignment_expr, $.pointer_type],
        [$.assignment_expression, $.pointer_or_null_type],
        [$.compound_assignment_expr, $.pointer_or_null_type],
        [$.assignment_expression, $.null_type],
        [$.compound_assignment_expr, $.null_type],
        [$._expression_except_range, $.arguments],
        [$.refrence_type],
        [$.assignment_expression, $.refrence_type],
        [$.compound_assignment_expr, $.refrence_type],
        [$.block],
        [$.return_argements, $.parameters],
        [$.return_expression, $.assignment_expression],
        [$.return_expression, $.compound_assignment_expr]
    ],

    word: $ => $.identifier,

    rules: {
        source_file: $ => seq(
            repeat($._statement)
        ),

        _statement: $ => choice(
            $.expression_statement,
            $._declaration_statement,
        ),

        _declaration_statement: $ => choice(
            $.function_item,
            $.function_signature_item,
            $.enum_item,
            $.struct_item,
            $.union_item,
            $.using_declaration,
            $.import_declaration,
            $.load_declaration,
            $.scope_declaration,
            $.private_declaration,
        ),

        struct_item: $ => seq(
            field('name', $._type_identifier),
            '::',
            'struct',
            field('body', $.field_declaration_list),
            optional(';'),
        ),

        field_declaration_list: $ => seq(
            '{',
                sepBy(';', choice($.field_declaration, $.enum_field_declaration)),
                optional(';'),
            '}',
        ),

        field_declaration: $ => seq(
            field('name', $._field_identifier),
            ':',
            field('type', $._type),
        ),

        enum_field_declaration: $ => prec.right(0,seq(
            field('name', $._field_identifier),
            ':',
            'enum',
            $.enum_variant_list,
        )),

        enum_item: $ => seq(
            field('name', $._type_identifier),
            '::',
            'enum',
            field('type_parameters', optional($._type)),
            optional(field('enum_flags', $.flags)),
            field('body', $.enum_variant_list),
        ),

        enum_variant_list: $ => prec.left(0,seq(
            '{',
                    sepBy(';', $.enum_variant),
                    optional(';'),
            '}',
            optional(';'),
        )),

        enum_variant: $ => seq(
            field('name', $.identifier),
            optional(seq(
                '=',
                field('value', $._expression),
            )),
        ),

        union_item: $ => seq(
            field('name', $._type_identifier),
            '::',
            'union',
            field('body', $.field_declaration_list),
            optional(';'),
        ),

        function_item: $ => seq(
            field('name', choice($.identifier, $.metavariable)),
            '::',
            'fn',
            optional(field('parameters', $.parameters)),
            optional(field('return_type', $._type)),
            optional(field('return_types', $.return_argements)),
            optional(field('function_flags', $.flags)),
            optional(seq('flag', field('flag_param', $.metavariable))),
            field('body', $.block),
        ),

        function_signature_item: $ => seq(
            field('name', choice($.identifier, $.metavariable)),
            '::',
            'fn',
            field('parameters', $.parameters),
            field('return_type', $._type),
            optional($.flags),
            ';',
        ),

        using_declaration: $ => seq(
            'using',
            field('argument', choice($.identifier, $.metavariable, $.field_access_expression)),
            ';',
        ),

        import_declaration: $ => seq(
            '#import',
            field('argument', $._expression),
        ),

        load_declaration: $ => seq(
            '#load',
            field('argument', $._expression),
        ),

        scope_declaration: $ => seq(
            '#scope',
            field('argument', $._expression),
        ),

        private_declaration: $ => seq(
            '#private',
        ),

        // Section - Expressions

        _expression_except_range: $ => choice(
            $.struct_expression,
            $.call_expression,
            $.return_expression,
            $.defer_expression,
            $.auto_expression,
            $._literal,
            $.field_expression,
            $.assignment_expression,
            $.compound_assignment_expr,
            $.declaration_expr,
            $.binary_expression,
            $.unary_expression,
            $.parenthesized_expression,
            $.type_cast_expression,
            $.field_access_expression,
            prec.left($.identifier),
            alias(choice(...builtin_types), $.identifier),
            $.metavariable,
        ),

        _expression: $ => choice(
            $._expression_except_range,
            $.range_expression,
        ),

        _expression_ending_with_block: $ => choice(
            $.block,
            $.defer_block,
            $.if_expression,
            $.loop_expression,
            $.switch_expression,
        ),

        range_expression: $ => prec.left(PREC.range, choice(
            seq($._expression, choice('..', '...', '..='), $._expression),
            seq($._expression, '..'),
            seq('..', $._expression),
            '..',
        )),

        field_expression: $ => prec(PREC.field, seq(
            optional(choice('&', '*')),
            field('value', $._expression),
            '.',
            field('field', choice(
                $._field_identifier,
                $.integer_literal,
            )),
            optional($.array_index),
        )),

        array_index: $ => seq(
            '[', $._expression, ']',
        ),

        expression_statement: $ => choice(
            seq($._expression, ';'),
            prec(1, $._expression_ending_with_block),
        ),

        call_expression: $ => prec(PREC.call, seq(
            field('function', $._expression_except_range),
            field('arguments', $.arguments),
        )),

        struct_expression: $ => prec.left(PREC.call, seq(
            field('name', $._type_identifier),
            field('body', $.field_initializer_list),
        )),

        field_initializer_list: $ => seq(
            '.',
            '{',
            sepBy(',', choice(
                $._expression,
                $.struct_initializer,
            )),
            optional(','),
            '}',
        ),

        struct_initializer: $ => prec.left(PREC.additive,seq(
          field('name', $._field_identifier),
          '=',
          field('value', $._expression),
        )),

        return_expression: $ => choice(
            prec.left(seq(
                'return',
                seq($._expression, repeat(seq(',', $._expression))),
                optional($.block),
            )),
            prec(-1, 'return'),
        ),

        return_argements: $ => prec.left(PREC.call, seq(
            '(',
                sepBy(',', seq($._type)),
                optional(','),
            ')',
        )),

        defer_expression: $ => choice(
            prec.left(seq('defer', $._expression)),
            prec(-1, 'defer'),
        ),

        auto_expression: $ => choice(
            prec.left(seq('auto', choice($._expression, $._type))),
            prec(-1, 'auto'),
        ),

        type_cast_expression: $ => prec.left(PREC.cast, seq(
            'cast',
            $.arguments,
            $._expression,
        )),

        field_access_expression: $ => prec.right(PREC.call, seq(
            field("name",$._type_identifier),
            repeat1(field("member",seq('.', $._field_identifier))),
            optional(seq(
                    '=',
                    field("value", $._expression),
                ),
            ),
        )),

        if_expression: $ => prec.right(seq(
            'if',
            field('condition', $._expression),
            field('consequence', $.block),
            optional(field('alternative', $.else_clause)),
        )),

        else_clause: $ => seq(
            'else',
            choice(
                $.block,
                $.if_expression,
            ),
        ),

        switch_expression: $ => seq(
            'switch',
            field('value', $._expression),
            field('body', $.switch_block),
        ),

        switch_block: $ => seq(
            '{',
                optional(seq(
                    repeat($.switch_arm),
                )),
                optional($.default_expression),
            '}',
        ),

        default_expression: $ => seq(
            'default',
            optional($._expression),
            $.block,
        ),

        switch_arm: $ => prec.right(seq(
            field('pattern', $._expression),
            $.block,
        )),

        loop_expression: $ => choice(
            // infinite loop
            prec.left(1, seq(
                'loop',
                $.block,
            )),

            // Loop without initialization and increment
            prec.left(1, seq(
                'loop',
                field('condition', $._expression),
                $.block,
            )),

            // Loop with initialization, condition, and increment
            prec.left(1, seq(
                'loop',
                field('init', $.declaration_expr),
                optional(';'),
                field('condition', $._expression),
                optional(';'),
                field('increment', $.compound_assignment_expr),
                $.block,
            )),
        ),

        declaration_expr: $ => prec.right(seq(
            field('variables', seq($.identifier, repeat(seq(',', $.identifier)))),
            optional(seq(':', field('type', $._type))),
            optional($.flags),
            optional(seq(field('operator', choice('::', ':', ':=', '=')), field('value', $._expression))),
        )),

        unary_expression: $ => prec(PREC.unary, seq(
            choice('-', '*', '!'),
            $._expression,
        )),

        binary_expression: $ => {
            const table = [
                [PREC.and, '&&'],
                [PREC.or, '||'],
                [PREC.bitand, '&'],
                [PREC.bitor, '|'],
                [PREC.bitxor, '^'],
                [PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
                [PREC.shift, choice('<<', '>>')],
                [PREC.additive, choice('+', '-')],
                [PREC.multiplicative, choice('*', '/', '%')],
            ];

            return choice(...table.map(([precedence, operator]) => prec.left(precedence, seq(
                field('left', $._expression),
                field('operator', operator),
                field('right', $._expression),
            ))));
        },

        compound_assignment_expr: $ => prec.left(PREC.assign, seq(
            field('left', $._expression),
            field('operator', choice('+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=')),
            field('right', $._expression),
        )),

        assignment_expression: $ => prec.left(PREC.assign, seq(
            field('left', $._expression),
            '=',
            field('right', $._expression)
        )),


        parenthesized_expression: $ => seq(
            '(',
                $._expression,
                ')',
        ),

        arguments: $ => seq(
            '(',
                sepBy(',', seq(optional($.auto_expression),choice($._type, $._expression))),
                optional(','),
            ')',
        ),


        block: $ => seq(
            '{',
                repeat($._statement),
                optional($._expression),
            '}',
            optional(';'),
        ),

        defer_block: $ => seq(
            'defer',
            $.block,
        ),

        parameters: $ => seq(
            '(',
                sepBy(',', seq(
                    choice(
                        $.parameter,
                        $.variadic_parameter,
                        $._type,
                    ))),
                optional(','),
                ')',
        ),

        variadic_parameter: _ => '...',

        parameter: $ => seq(
            field('name', choice(
                $.identifier,
                $.metavariable,
            )),
            ':',
            field('type', $._type),
            optional(
                seq(
                    '=',
                    field("initialization", $._expression),
                ),
            ),
            optional($.flags),
            optional($._expression),
        ),

        _type: $ => choice(
            $._type_identifier,
            $.pointer_type,
            $.pointer_or_null_type,
            $.array_type,
            $.null_type,
            $.refrence_type,
            alias(choice(...builtin_types), $.primitive_type),
        ),

        pointer_or_null_type: $ => seq(
            '*?',
            field('type', $._type),
            optional($._expression),
        ),

        pointer_type: $ => seq(
            choice('*','@'),
            field('type', $._type),
            optional($._expression),
        ),

        null_type: $ => seq(
            '?',
            field('type', $._type),
            optional($._expression),
        ),

        refrence_type: $ => seq(
            '&',
            field('type', $._type),
            optional($._expression),
        ),

        array_type: $ => seq(
            '[',
            optional($._expression),
            ']',
            field('type', $._type),
            optional($.parameters),
        ),


        flags: $ => choice(
            "#export",
            "#extern",
            "#comptime",
            "#inline",
            "#flags",
            "#noinit",
            "#thread_local",
            "#test",
            "#build_entry",
            "#entry",
            "#compiler",
        ),

        metavariable: _ => /\$[a-zA-Z_]\w*/,
        identifier: _ => /(r#)?[_\p{XID_Start}][_\p{XID_Continue}]*/,
        _field_identifier: $ => alias($.identifier, $.field_identifier),

        comment: $ => choice(
            $.line_comment,
            $.block_comment,
        ),

        line_comment: _ => token(seq(
            '//', /.*/,
        )),


        negative_literal: $ => seq('-', choice($.integer_literal, $.float_literal)),
        integer_literal: _ => token(seq(
            choice(
                /[0-9][0-9_]*/,
                /0x[0-9a-fA-F_]+/,
                /0b[01_]+/,
                /0o[0-7_]+/,
            ),
        )),

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

        boolean_literal: _ => choice('true', 'false'),
        null_literal: _ => 'null',
        _field_identifier: ($) => alias($.identifier, $.field_identifier),
        _type_identifier: $ => alias($.identifier, $.type_identifier),

        string_literal: $ => seq(
            alias(/[bc]?"/, '"'),
            repeat(choice(
                $.escape_sequence,
                $._string_content,
            )),
            token.immediate('"'),
        ),

        char_literal: _ => token(seq(
            optional('b'),
            '\'',
            optional(choice(
                seq('\\', choice(
                    /[^xu]/,
                    /u[0-9a-fA-F]{4}/,
                    /u{[0-9a-fA-F]+}/,
                    /x[0-9a-fA-F]{2}/,
                )),
                /[^\\']/,
            )),
            '\'',
        )),

        _literal: $ => choice(
            $.string_literal,
            $.raw_string_literal,
            $.char_literal,
            $.boolean_literal,
            $.null_literal,
            $.integer_literal,
            $.float_literal,
        ),

        _literal_pattern: $ => choice(
            $.string_literal,
            $.raw_string_literal,
            $.char_literal,
            $.boolean_literal,
            $.integer_literal,
            $.float_literal,
            $.negative_literal,
        ),
    },
});


function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(optional(sep), rule)));
}

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}
