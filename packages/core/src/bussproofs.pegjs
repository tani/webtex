// Bussproofs LaTeX Commands Grammar
// PEG.js grammar for parsing bussproofs package commands while preserving formula content as raw strings

start
  = bussproofs_command

bussproofs_command
  = axiom_command
  / unary_inf_command
  / binary_inf_command
  / trinary_inf_command
  / quaternary_inf_command
  / quinary_inf_command
  / abbreviated_command

// Core inference commands
axiom_command "axiom command"
  = "\\AxiomC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "axiom", 
        command: "AxiomC", 
        content: content 
      };
    }

unary_inf_command "unary inference command"
  = "\\UnaryInfC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "UnaryInfC", 
        arity: 1,
        content: content 
      };
    }

binary_inf_command "binary inference command"
  = "\\BinaryInfC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "BinaryInfC", 
        arity: 2,
        content: content 
      };
    }

trinary_inf_command "trinary inference command"
  = "\\TrinaryInfC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "TrinaryInfC", 
        arity: 3,
        content: content 
      };
    }

// Extended inference commands
quaternary_inf_command "quaternary inference command"
  = "\\QuaternaryInfC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "QuaternaryInfC", 
        arity: 4,
        content: content 
      };
    }

quinary_inf_command "quinary inference command"
  = "\\QuinaryInfC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "QuinaryInfC", 
        arity: 5,
        content: content 
      };
    }

// Abbreviated forms
abbreviated_command
  = axiom_abbreviated
  / unary_inf_abbreviated
  / binary_inf_abbreviated
  / trinary_inf_abbreviated

axiom_abbreviated "abbreviated axiom command"
  = "\\AXC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "axiom", 
        command: "AxiomC", 
        abbreviated: true,
        content: content 
      };
    }

unary_inf_abbreviated "abbreviated unary inference command"
  = "\\UIC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "UnaryInfC", 
        abbreviated: true,
        arity: 1,
        content: content 
      };
    }

binary_inf_abbreviated "abbreviated binary inference command"
  = "\\BIC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "BinaryInfC", 
        abbreviated: true,
        arity: 2,
        content: content 
      };
    }

trinary_inf_abbreviated "abbreviated trinary inference command"
  = "\\TIC" _ "{" content:raw_brace_content "}" {
      return { 
        type: "inference", 
        command: "TrinaryInfC", 
        abbreviated: true,
        arity: 3,
        content: content 
      };
    }

// Raw content extraction with proper brace matching
raw_brace_content
  = chars:(
      !("}" / "{") char:.  { return char; }
    / "{" nested:raw_brace_content "}" { return "{" + nested + "}"; }
    )* {
      return chars.join('');
    }

// Whitespace
_ "whitespace"
  = [ \t\n\r]*