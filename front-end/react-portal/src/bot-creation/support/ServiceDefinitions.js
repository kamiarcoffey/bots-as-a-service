// STUB -- unused.
// Future-proofing for any api-based GUI generation.
const serviceDefinitions = [
  {
    name: "fandom search",
    invocation: {
      symbol: "!",
      term: "fandom",
    },
    available: true,
    defaultOn: false,
    description: "Search the input fandom and return the top results.",
    configurableQuery: true,
    inputs: [
      {
        name: "name",
        helperText: "the fandom subdomain, i.e.: [name].fandom.com",
        adornments: {
          end: ".fandom.com",
        },
        flavor: "text",
        required: true,
        default: null,
        meta:{
          validation: {
            type: "request",
            target: "https://INPUT_TERM.fandom.com/api/v1/Mercury/WikiVariables"
          }
        }
      }
    ]
  },
  {
    name: "translation",
    invocation: {
      symbol: "!",
      term: "translate",
    },
    available: true,
    defaultOn: false,
    description: "Translate the parent post or comment to the target language.",
    configurableQuery: true,
    inputs: []
  },
  {
    name: "flight lookup",
    invocation: {
      symbol: "!",
      term: "flights",
    },
    available: false,
    defaultOn: false,
    description: "Search for flight information.",
    configurableQuery: false,
    inputs: []
  }
]
